import { genFileId } from "element-plus";
import {computed, reactive, ref} from "vue";
import { 
  getCellDataListApi, 
  getCellDataApi,
  createCellDataApi,
  updateCellDataApi,
  deleteCellDataApi,
  batchDeleteCellDataApi,
  deleteAllCellDataApi,
  uploadCellDataCsvApi,
  downloadCellDataApi 
} from "@/apis/MParser/celldata";


export default () => {
    const loading = ref(true);  // 显示加载状态

    const viewConfig = reactive({ // 界面定制配置
        tableMaxHeight: 8200, //列表最高高度， 8K
        buttons: {  // 顶栏按钮配置
            refresh: true,
            upload: true,
            add: true,
            download: true,
        },
        table: { // 表格配置
            idColumnName: "ID", //主键
            show: false, //是否显示
            sortable: true,  //是否可排序
            exportModule: '/CellData_module.xlsx',  //导出模板
            exportSheetName: 'CellData',  //导出sheet名称
            exportFileName: `Export_CellData-${new Date().toISOString().replace(/[-:]|(\.\d{3})|T|Z/g, '')}.xlsx`,
            exportStaIndex: 2,  //导出起始行
            ctlButton: computed(() => true),  //是否显示操作按钮，按权限决定
            ctlButtons: computed(() => [  //列表操作按钮，动态按权限决定是否显示
                { title: "编辑", type: "primary", size: "small", action: "edit", show: true },
                { title: "删除", type: "danger", size: "small", action: "delete", show: true },
                { title: "修改记录", type: "info", size: "small", action: "log", show: true },
            ].filter(btn => btn.show)),
        },
        footer: {  // 底部配置
            show: true,  //是否显示
            deleteBtn: computed(() => true),  //是否显示批量删除按钮，按权限决定
            pagination: {  // 分页栏
                show: true,  //是否显示
                size: 50,    //每页显示条数
                pageSizes: [50, 100, 200, 300, 400, 500],  //每页显示条数选择
                layout: "total, sizes, prev, pager, next, jumper",  // 分页栏布局
            },
        },
    });

    const dialog = reactive({  // 弹窗配置
        upload: {
            show: false,
            celldata: {
                select: null,
                uploading: false,
                download: false,
                downloading: false,
                download_file: null,
                file_object: null,
            },
            cellscript: {
                select: null,
                uploading: false,

            }
        }
    });

    const drawer = reactive({  // 抽屉配置
        edit: {
            show: false,
            title: "新增",
            data: {},
            saving: false,
            save_disable: true,
            template: null
        }
    });

    // 变量

    const filterTemp = reactive({ field: null, value: null }); // 用于临时保存搜索条件
    const selected = ref([]);  // 列表选中项
    const dataTotal = ref(0); // 数据总数
    const tableData = ref([]);  // 列表数据
    const fields = ref([]); // 字段列表，Table表头
    const search = reactive({
        field: null,
        value: null,
        size: viewConfig.footer.pagination.size,
        page: 1,
        order: null,
        sort: null
    }); // 当前搜索条件配置, 发生变化时自动提交至后台获取对应数据


    // 接口API
    const serverAPI = {
        getData: (params) => { // 获取Table数据,表头信息,总行数
            return getCellDataListApi(params)
        },
        getCell: async (cgi) => { // 获取单个CellData数据
            return await getCellDataApi(cgi)
        },
        saveData: async (data) => { // 保存CellData数据
            if (data[viewConfig.table.idColumnName] === -1) {
                return await createCellDataApi(data)
            } else {
                return await updateCellDataApi(data)
            }
        },
        delData: async (ids) => { // 删除CellData数据
            return await batchDeleteCellDataApi(ids)
        },
        uploadCellData: async (file) => { // 上传CellData数据
            return await uploadCellDataCsvApi(file)
        },
        deleteCell: async (cgi) => { // 删除单个CellData数据
            return await deleteCellDataApi(cgi)
        },
        deleteAllCell: async () => { // 删除所有CellData数据
            return await deleteAllCellDataApi()
        },
        downloadCellData: async (cgi) => { // 下载单个CellData数据
            return await downloadCellDataApi(cgi)
        },

        
    }

    // 界面接口函数
    function withLoading(asyncFunction) {
        return async function (...args) {
            loading.value = true;
            try {
                await asyncFunction(...args);
            } catch (error) {
                await showMsg(`操作失败: ${error.message}`, "error");
            } finally {
                loading.value = false;
            }
        };
    }

    const onSearchValueChange = () => {
        search.value = filterTemp.field ? filterTemp.value : null;
        search.field = filterTemp.value ? filterTemp.field : null;
    };
    const onSearchButtonClick = () => {
        search.value = filterTemp.field ? filterTemp.value : null;
        search.field = filterTemp.value ? filterTemp.field : null;
    };
    const onPageSizeChange = (size) => { search.size = size };
    const onPageNumberChange = (page) => { search.page = page };
    const onTableSortChange = (col) => {
        const { prop, order } = col;
        search.order = order ? order === "ascending" ? "asc" : "desc" : null;
        search.sort = search.order ? prop : null;
    };
    const onTableSelectRow = (row) => { selected.value = row };
    const onRefreshButtonClick = async () => { await getTableData() };
    const getTableData = withLoading(async () => {
        const data_res = await serverAPI.getData()
        tableData.value = null
        if (data_res.status === 200) {
            dataTotal.value = data_res.data.total
            tableData.value = data_res.data.data
            fields.value = data_res.data.fields
            viewConfig.table.show = true
        } else {
            await showMsg(`获取数据失败: ${data_res.data.message}`, "error");
        }
    })

    // 自定义方法
    const ctlTableMaxHeight = (view, offset) => {
        if (view.value) { viewConfig.tableMaxHeight = view.value["clientHeight"] - offset }
    }

    const delRow = async (row_ids) => {
        if (row_ids.length === 0) { return }
        const confirmMsg = `是否确定删除选中数据?<br>此操作不可逆!${row_ids.length > 1 ? `<br>本次选择删除数据：${row_ids.length}条` : ''}`;
        if (await showMsg(confirmMsg, "inquire")) {
            const response = await serverAPI.delData(row_ids)
            if (response.status === 200) {
                await showMsg("删除成功", "success");
                await getTableData()
            } else {
                await showMsg(`删除失败: ${response.data.message || '未知错误'}`, "error");
            }
        }
    }

    const onDeleteBatchButtonClick = withLoading(async () => {
        // 批量删除按钮被点击
        await delRow(selected.value.map(row => row[viewConfig.table.idColumnName]));
    });


    const onTableCtlButtonClick = withLoading(async (action, row) => {
        switch (action) {
            case "edit":
                drawer.edit.title = "编辑"
                drawer.edit.data = { ...row };
                drawer.edit.template = { ...row }
                drawer.edit.show = true;
                break;
            case "delete":
                await delRow([row[viewConfig.table.idColumnName]]);
                break;
            case "log":
                console.log("查看日志：", row);
                break;
            default:
                await showMsg(`未知操作类型: ${action}`, "error");
        }
    });
    const onUploadButtonClick = withLoading(async () => {
        dialog.upload.show = true;

    });
    /** @type {import('vue').Ref<import('element-plus').UploadInstance | null>} */
    const upload_celldata_file = ref(null);
    function onCellDataExceed(files) {
        if (upload_celldata_file) {
            upload_celldata_file.value.clearFiles();
            const file = files[0];
            file.uid = genFileId();
            upload_celldata_file.value.handleStart(file);
            dialog.upload.celldata.file_object = file
        }
    }
    function onCellDataUploadFileChange(file, files) {
        if (files.length > 0) { dialog.upload.celldata.select = file; } else { dialog.upload.celldata.select = null }
    }

    async function upload_celldata(param) {
        dialog.upload.celldata.uploading = true
        dialog.upload.celldata.download = false
        const res = await serverAPI.uploadCellData(param.file)
        if (res.status !== 200) {
            upload_celldata_file.value.clearFiles();
            await showMsg(`上传失败: ${res.data.message || '未知错误'}`, "error");
        } else {
            await showMsg('处理完成', 'success')

            dialog.upload.celldata.download_file = res.data.message
            dialog.upload.celldata.download = true
        }

        dialog.upload.celldata.uploading = false
    }

    async function downloadCellScript() {
        dialog.upload.celldata.downloading = true
        const download_url = `/api/cache/${dialog.upload.celldata.download_file}`
        try {
            const response = await fetch(download_url);
            if (!response.ok) { await showMsg('Network response was not ok', 'error'); return; }
            const blob = await response.blob();
            // 使用 FileReader 读取 blob 数据
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;
                if (typeof result === 'string') {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = dialog.upload.celldata.download_file; // 使用提取的文件名
                    link.click();
                }
            };
            reader.readAsDataURL(blob); // 读取 blob 数据为 Data URL

        } catch (error) {
            await showMsg(`下载失败: ${error}`, 'error')
        } finally {
            dialog.upload.celldata.downloading = false
        }

    }

    /** @type {import('vue').Ref<import('element-plus').UploadInstance | null>} */
    const upload_cellscript_file = ref(null);
    function onCellScriptExceed(files) {
        if (upload_cellscript_file.value) {
            upload_cellscript_file.value.clearFiles();
            const file = files[0];
            file.uid = genFileId();
            upload_cellscript_file.value.handleStart(file);
        }
    }
    function onCellScriptUploadFileChange(file, files) {
        if (files.length > 0) { dialog.upload.cellscript.select = file; } else { dialog.upload.cellscript.select = null }
    }


    const onAddButtonClick = withLoading(async () => {
        // 新增按钮被点击
        drawer.edit.title = "新增";
        drawer.edit.data = {};

        drawer.edit.data[viewConfig.table.idColumnName] = -1;
        drawer.edit.template = { ...drawer.edit.data };
        drawer.edit.show = true;
    });

    const downloadLoad = ref(false);
    const onDownloadButtonClick = async () => {
        // 下载按钮被点击
        downloadLoad.value = true;
        const filter = reactive({ ...search });
        filter.size = -1;
        const data_res = await serverAPI.getData(filter)
        if (data_res.status === 200) {
            await saveExcel(
                data_res.data.data,
                viewConfig.table.exportModule,
                viewConfig.table.exportSheetName,
                viewConfig.table.exportStaIndex,
                viewConfig.table.exportFileName
            )
            delete data_res.data
        } else {
            await showMsg(`下载数据失败: ${data_res.data.message}`, "error");
        }
        downloadLoad.value = false;

    };



    async function drawerSave() {
        drawer.edit.saving = true
        const res = await serverAPI.saveData(drawer.edit.data);
        if (res.status !== 200) {
            drawer.edit.saving = false;
            await showMsg(`保存失败: ${res.data.message}`, "error");
            return;
        }
        await showMsg(res.data.message, "success");
        drawer.edit.saving = false;
        drawer.edit.show = false;
        await getTableData();
    }

    return {
        // 变量
        loading,
        search,
        filterTemp,
        fields,
        viewConfig,
        downloadLoad,
        tableData,
        selected,
        dataTotal,
        dialog,
        drawer,
        // 函数
        ctlTableMaxHeight,
        onSearchValueChange,
        onSearchButtonClick,
        onUploadButtonClick,
        onRefreshButtonClick,
        onAddButtonClick,
        onDownloadButtonClick,
        onTableSelectRow,
        onTableSortChange,
        onTableCtlButtonClick,
        onDeleteBatchButtonClick,
        onPageSizeChange,
        onPageNumberChange,
        onCellDataExceed,
        onCellScriptExceed,
        onCellDataUploadFileChange,
        onCellScriptUploadFileChange,
        drawerSave,
        downloadCellScript,
    }
}
