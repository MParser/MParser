
from app.core.logger import log
import pandas as pd
from io import BytesIO
from lxml import etree
from typing import Dict, List, Union
import os
from datetime import datetime

class ParseError(Exception):

    def __init__(self, data_type, message, error_type="UnknownError"):
        super().__init__(message)
        self.data_type = data_type
        self.error_type = error_type
        self.message = message

    def __str__(self):
        return f"Parser({self.data_type})[{self.error_type}] {self.message}"


def mro(data: BytesIO | bytes) -> List[Dict[str, Union[pd.Timestamp, int, float]]]:

    try:
        result = []

        # 定义需要检查的字段
        smr_check = {
            "MR_LteScEarfcn", "MR_LteScPci", "MR_LteScRSRP",
            "MR_LteNcEarfcn", "MR_LteNcPci", "MR_LteNcRSRP"
        }

        if isinstance(data, bytes):
            tree = etree.fromstring(data)
        elif isinstance(data, BytesIO):
            tree = etree.parse(data).getroot()
        LteScENBID = tree.find('.//eNB').attrib['id']  # 提取eNodeBID
        file_header = tree.find('.//fileHeader')
        if file_header is not None:
            start_time = file_header.get('startTime')
            data_time = pd.to_datetime(start_time)
        else:
            raise ParseError(data_type="MRO", error_type="DataError", message="Missing startTime in fileHeader")
        for measurement in tree.findall('.//measurement'):
            smr_content = measurement.find('smr').text.strip()
            smr_content = smr_content.replace('MR.', 'MR_')
            smr_fields = smr_content.split()
            data = []

            if not smr_check.issubset(set(smr_fields)):
                continue  # 检查必要字段是否存在，当不存在时跳过该measurement节点

            headers = ["MR_LteScENBID"] + list(smr_check)  # 字段列表(添加MR_LteScENBID)
            smr_values = {x: i for i, x in enumerate(smr_fields) if x in smr_check}  # 字段索引映射
            max_field_num = smr_values[max(smr_values, key=smr_values.get)]  # 找出所需字段中最后的索引位置
            for obj in measurement.findall('object'):  # 遍历每个measurement下的object元素
                for v in obj.findall('v'):  # 遍历每个object下的v元素（<v></v>）
                    values = v.text.strip().split()  # 分割v元素内的文本内容
                    if len(values) >= max_field_num:  # 如果值的数量不够，跳过这条记录
                        # 构建一行数据：[LteScENBID] + [对应位置的测量值]
                        row_data = [LteScENBID] + [values[smr_values[x]] for x in headers[1:]]
                        if 'NIL' not in row_data:
                            data.append(row_data)  # 如果数据中没有NIL（无效值），则添加到数据列表中

            df = pd.DataFrame(data, columns=headers)  # 将数据转换为DataFrame
            # 将 NIL 转换为 NaN
            for col in smr_check:
                df[col] = pd.to_numeric(df[col], errors='coerce')

            # 进行类型转换
            df = df.astype({
                'MR_LteScENBID': 'int32',
                'MR_LteScEarfcn': 'int32',
                'MR_LteScPci': 'int32',
                'MR_LteScRSRP': 'int32',
                'MR_LteNcEarfcn': 'int32',
                'MR_LteNcPci': 'int32',
                'MR_LteNcRSRP': 'int32'
            })

            # 计算同频6db和MOD3采样点数
            df['MR_LteFCIn6db'] = (
                    (df['MR_LteScEarfcn'] == df['MR_LteNcEarfcn']) &
                    (df['MR_LteScRSRP'] - df['MR_LteNcRSRP'] <= 6)
            ).astype(int)

            # 计算MOD3采样点数
            df['MR_LTEMod3'] = (
                    (df['MR_LteScEarfcn'] == df['MR_LteNcEarfcn']) &
                    (df['MR_LteScPci'] % 3 == df['MR_LteNcPci'] % 3) &
                    (df['MR_LteScRSRP'] - df['MR_LteNcRSRP'] <= 3) &
                    (df['MR_LteScRSRP'] >= 30)
            ).astype(int)

            # 数据分组统计 - 按指定字段分组，统计每组的和以及平均值
            grouped = df.groupby(
                ["MR_LteScENBID", "MR_LteScEarfcn", "MR_LteScPci", "MR_LteNcEarfcn", "MR_LteNcPci"]
            ).agg(
                MR_LteScSPCount=pd.NamedAgg(column="MR_LteScRSRP", aggfunc='count'),
                MR_LteScRSRPAvg=pd.NamedAgg(column="MR_LteScRSRP", aggfunc=lambda x: x.mean()),
                MR_LteNcSPCount=pd.NamedAgg(column="MR_LteNcRSRP", aggfunc='count'),
                MR_LteNcRSRPAvg=pd.NamedAgg(column="MR_LteNcRSRP", aggfunc=lambda x: x.mean()),
                MR_LteCC6Count=pd.NamedAgg(column="MR_LteFCIn6db", aggfunc='sum'),
                MR_LteMOD3Count=pd.NamedAgg(column="MR_LTEMod3", aggfunc='sum')
            ).reset_index()

            # 添加DataTime时间字段(15分钟粒度文件时间)
            grouped['DataTime'] = data_time.floor('15min')

            # 类型转换，确保与数据库类型一致
            grouped['MR_LteScENBID'] = grouped['MR_LteScENBID'].astype('int32')
            grouped['MR_LteScEarfcn'] = grouped['MR_LteScEarfcn'].astype('int32')
            grouped['MR_LteScPci'] = grouped['MR_LteScPci'].astype('int32')
            grouped['MR_LteNcEarfcn'] = grouped['MR_LteNcEarfcn'].astype('int32')
            grouped['MR_LteNcPci'] = grouped['MR_LteNcPci'].astype('int32')

            result.append(grouped.to_dict('records'))  # 将处理后的数据添加到结果中
        
        # 将嵌套列表扁平化为单一列表
        flat_result = []
        for batch in result:
            flat_result.extend(batch)
        
        return flat_result  # 返回扁平化后的列表
    except etree.XMLSyntaxError as e:
        raise ParseError(data_type="MRO", error_type="XMLSyntaxError", message=f"XML Syntax Error: {str(e)}")
    except ValueError as e:
        raise ParseError(data_type="MRO", error_type="ValueError", message=f"Value Error: {str(e)}")
    except KeyError as e:
        raise ParseError(data_type="MRO", error_type="KeyError", message=f"Missing Key: {str(e)}")
    except Exception as e:
        raise ParseError(data_type="MRO", error_type="UnexpectedError", message=f"Unexpected Error: {str(e)}")


def mdt(data: BytesIO | bytes) -> List[Dict[str, Union[str, int, float]]]:
    try:
        # 读取CSV文件 - 避免不必要的数据复制
        if isinstance(data, bytes):
            csv_data = BytesIO(data)
        elif isinstance(data, BytesIO):
            csv_data = data
        df = pd.read_csv(
            csv_data, 
            encoding='gbk', 
            header=1, 
            on_bad_lines='skip', 
            index_col=False,
            na_values=['', 'N/A', 'NA', 'NULL', 'null', '#N/A', '#N/A N/A']
        )
        df.columns = [col.replace(' ', '_') for col in df.columns]  # 确保列名没有空格
        keep_fields = [
            'MeasAbsoluteTimeStamp', 'MME_Group_ID', 'MME_Code', 'MME_UE_S1AP_ID', 'Report_CID', 'Report_PCI', 'Report_Freq', 'TR_ID', 'TRSR_ID', 'TCE_ID',
            'Longitude', 'Latitude', 'SC_ID', 'SC_PCI', 'SC_Freq', 'SCRSRP', 'SCRSRQ','NC1PCI', 'NC1Freq', 'NC1RSRP', 'NC1RSRQ', 'NC2PCI', 
            'NC2Freq', 'NC2RSRP', 'NC2RSRQ', 'NC3PCI', 'NC3Freq', 'NC3RSRP', 'NC3RSRQ', 'NC4PCI', 'NC4Freq', 'NC4RSRP', 'NC4RSRQ',
            'NC5PCI', 'NC5Freq', 'NC5RSRP', 'NC5RSRQ'
        ]
        default_values = {
            'MME_Group_ID': -1, 'MME_Code': -1, 'MME_UE_S1AP_ID': -1, 
            'TR_ID': -1, 'TRSR_ID': -1, 'TCE_ID': -1, 'SC_ID': -1, 
            'SC_PCI': -1, 'SC_Freq': -1, 'SCRSRP': -140, 'SCRSRQ': -20,
            'NC1PCI': -1, 'NC1Freq': -1, 'NC1RSRP': -140, 'NC1RSRQ': -20,
            'NC2PCI': -1, 'NC2Freq': -1, 'NC2RSRP': -140, 'NC2RSRQ': -20,
            'NC3PCI': -1, 'NC3Freq': -1, 'NC3RSRP': -140, 'NC3RSRQ': -20,
            'NC4PCI': -1, 'NC4Freq': -1, 'NC4RSRP': -140, 'NC4RSRQ': -20,
            'NC5PCI': -1, 'NC5Freq': -1, 'NC5RSRP': -140, 'NC5RSRQ': -20
        }
        # 检查必要字段是否存在
        required_fields = [
            'MeasAbsoluteTimeStamp', 'MME_Group_ID', 'MME_Code', 'MME_UE_S1AP_ID', 
            'Report_CID', 'Report_PCI', 'Report_Freq', 'TR_ID', 'TRSR_ID', 'TCE_ID',
            'Longitude', 'Latitude', 'SC_ID', 'SC_PCI', 'SC_Freq', 'SCRSRP', 'SCRSRQ'
        ]
        missing_fields = [field for field in required_fields if field not in df.columns]
        if missing_fields:
            # 如果缺失非NC开头的必要字段，直接返回空数据
            log.warning('无效MDT数据，缺失关键字段')
            import gc
            del df
            gc.collect()
            return []
            
        # 检查keep_fields中缺失的字段并一次性添加
        missing_fields = {field: default_values[field] for field in keep_fields if field not in df.columns and field in default_values}
        if missing_fields:
            df = df.assign(**missing_fields)
        
        # 筛选指定字段
        df = df[keep_fields]
        
        # 过滤空值
        df = df[
            df['MeasAbsoluteTimeStamp'].notna() & 
            df['Report_CID'].notna() & 
            df['Longitude'].notna() & 
            df['Latitude'].notna() &
            df['SC_PCI'].notna() &
            df['SC_Freq'].notna() &
            df['SCRSRP'].notna()
            
        ]
        if df.empty:
            import gc
            del df
            gc.collect()
            return []
        
        # 转换时间戳并处理数值列
        df['MeasAbsoluteTimeStamp'] = pd.to_datetime(df['MeasAbsoluteTimeStamp'], format='%Y-%m-%dT%H:%M:%S.%f')
        df = df[df['MeasAbsoluteTimeStamp'].notna()]
        
        # 转换数值列并过滤无效数据
        for col in ['Report_CID', 'Report_PCI', 'Report_Freq']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df = df[df[col].notna()]
        
        # 额外过滤Report_CID的有效值
        df = df[df['Report_CID'] >= 1000000]
        
        # 计算SCeNodeBID和CellID
        cid_str = df['Report_CID'].astype(str).str[5:].astype(int)
        df['SCeNodeBID'] = (cid_str // 256).astype(int)
        df['CellID'] = (cid_str % 256).astype(int)
        
        # 过滤有效的SCeNodeBID和CellID
        df = df[(df['SCeNodeBID'] >= 1000) & (df['CellID'] >= 0)]
        df = df.fillna(default_values) # 使用默认值填充空字段
        df['DataTime'] = pd.to_datetime(df['MeasAbsoluteTimeStamp']).dt.ceil('15min')
        df = df[df['DataTime'].notna()]
        
        
        # 构建类型映射字典
        dtypes = {col: 'int32' for col in ['SC_PCI', 'SC_Freq', 'MME_Group_ID', 'MME_Code', 
                'TR_ID', 'TRSR_ID', 'TCE_ID', 'Report_PCI', 'Report_Freq', 'SCeNodeBID', 'CellID',
                'NC1PCI', 'NC1Freq', 'NC1RSRP', 'NC1RSRQ',
                'NC2PCI', 'NC2Freq', 'NC2RSRP', 'NC2RSRQ',
                'NC3PCI', 'NC3Freq', 'NC3RSRP', 'NC3RSRQ',
                'NC4PCI', 'NC4Freq', 'NC4RSRP', 'NC4RSRQ',
                'NC5PCI', 'NC5Freq', 'NC5RSRP', 'NC5RSRQ'] if col in df.columns}

        # 添加int64类型的列
        dtypes.update({col: 'int64' for col in ['SC_ID', 'MME_UE_S1AP_ID', 'Report_CID'] if col in df.columns})

        # 一次性应用所有类型转换
        df = df.astype(dtypes)
        
        
        result_dict = df.to_dict('records')
        result = [result_dict]
        import gc
        del df
        gc.collect()
        
        # 将嵌套列表扁平化为单一列表
        flat_result = []
        for batch in result:
            flat_result.extend(batch)
        
        return flat_result  # 返回扁平化后的列表
    except pd.errors.ParserError as e:
        raise ParseError(data_type="MDT", error_type="CSVParserError", message=f"CSV Parser Error: {str(e)}")
    except ValueError as e:
        raise ParseError(data_type="MDT", error_type="ValueError", message=f"Value Error: {str(e)}")
    except KeyError as e:
        raise ParseError(data_type="MDT", error_type="KeyError", message=f"Missing Key: {str(e)}")
    except Exception as e:
        raise ParseError(data_type="MDT", error_type="UnexpectedError", message=f"Unexpected Error: {str(e)}")
