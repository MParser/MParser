import pandas as pd
from io import BytesIO
from lxml import etree
from typing import Dict, List, Union


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
        result = []
        keep_fields = [
            'MeasAbsoluteTimeStamp', 'MME Group ID', 'MME Code', 'MME UE S1AP ID', 'Report CID', 'Report PCI', 'Report Freq', 'TR ID', 'TRSR ID', 'TCE ID',
            'Longitude', 'LatitudeSign', 'Latitude', 'SC ID', 'SC PCI', 'SC Freq', 'SCRSRP', 'SCRSRQ'
        ]
        # 定义默认值映射 - 为空字段提供默认值
        default_values = {
            'MME Group ID': -1, 'MME Code': -1, 'MME UE S1AP ID': -1,
            'Report CID': -1, 'Report PCI': -1, 'Report Freq': -1,
            'TR ID': -1, 'TRSR ID': -1, 'TCE ID': -1,
            'SC ID': -1, 'SC PCI': -1, 'SC Freq': -1,
            'SCRSRP': -140, 'SCRSRQ': -20,
            'LatitudeSign': -1
        }

        df = pd.read_csv(csv_data, encoding='gbk', header=1, on_bad_lines='skip', index_col=False)
        df = df[df['MeasAbsoluteTimeStamp'].notna() & df['Longitude'].notna() & df['Latitude'].notna()]
        if df.empty:
            return result # CSV文件为空
        df = df[keep_fields] # 筛选指定字段
        # 将MeasAbsoluteTimeStamp转为日期时间格式
        df['MeasAbsoluteTimeStamp'] = pd.to_datetime(df['MeasAbsoluteTimeStamp'], format='%Y-%m-%dT%H:%M:%S.%f').dt.strftime('%Y-%m-%d %H:%M:%S')
        
        df = df.fillna(default_values) # 使用默认值填充空字段
        df['DataTime'] = pd.to_datetime(df['MeasAbsoluteTimeStamp']).dt.ceil('15min').dt.strftime('%Y-%m-%d %H:%M:%S') # 添加DataTime列, 值为MeasAbsoluteTimeStamp向上取整(15分钟粒度)
        
        result_dict = df.to_dict('records')
        result.append(result_dict)
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