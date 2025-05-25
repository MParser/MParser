<script setup>
import { onMounted, ref, watch } from 'vue';
import CellData from './CellData.js';

const view = ref(null);

const {
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
    upload_celldata_file,
    upload_cellscript_file,
    drawer,
    // 函数
    ctlTableMaxHeight,
    getTableData,
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
    upload_celldata,
    onCellDataUploadFileChange,
    onCellScriptUploadFileChange,
    upload_cellscript,
    drawerSave,
    downloadCellScript,

    fileInput,
    handleFileSelect,
    uploading,
} = CellData();

const celldata_file = upload_celldata_file;
const cellscript_file = upload_cellscript_file;

onMounted(async () => {
  const height_offset = 150
  ctlTableMaxHeight(view, height_offset)
  console.log(view.value, height_offset);
  
  window.addEventListener('resize', () => ctlTableMaxHeight(view, height_offset));
  await getTableData()
})

watch(search, async (newSearch) => {
  await getTableData(newSearch)
})
</script>

<template>
  <div ref="view" v-loading="loading" class="view-main" element-loading-text="loading...">
    <el-main class="view-Header">
      <el-main class="view-SearchView">
        <el-select v-model="filterTemp.field" placeholder="查询字段" size="default" style="max-width: 20%">
          <el-option
            v-for="field in fields"
            :key="field.prop"
            :label="field.label || field.prop"
            :value="field.prop"
          />
        </el-select>
        <el-input
          v-model="filterTemp.value"
          :disabled="filterTemp.field === null"
          clearable
          placeholder="搜索值"
          style="max-width: 54%; width: 42%"
          @change="onSearchValueChange"
        />
        <el-button
          :disabled="filterTemp.field === null"
          icon="Search"
          style="margin-left: 5px"
          type="primary"
          @click="onSearchButtonClick"
        />
      </el-main>
      <el-main class="view-Buttons">
        <el-tooltip v-if="viewConfig.buttons.upload" content="上传数据" effect="dark" placement="top-start">
          <el-button icon="Upload" type="warning" @click="onUploadButtonClick" :loading="uploading" />
        </el-tooltip>
        <el-tooltip v-if="viewConfig.buttons.refresh" :disabled="loading" content="刷新" effect="dark"
          placement="top-start">
          <el-button icon="Refresh" type="success" @click="onRefreshButtonClick" />
        </el-tooltip>
        <el-tooltip v-if="viewConfig.buttons.add" content="新增" effect="dark" placement="top-start">
          <el-button icon="CirclePlus" type="primary" @click="onAddButtonClick" />
        </el-tooltip>
        <el-tooltip v-if="viewConfig.buttons.download" :disabled="downloadLoad" content="导出当前数据" effect="dark"
          placement="top-start">
          <el-button :loading="downloadLoad" color="#626aef" icon="Download" @click="onDownloadButtonClick" />
        </el-tooltip>
      </el-main>
    </el-main>

    <el-main v-if="viewConfig.table.show" class="view-Table">
      <el-table
        :border="true"
        :data="tableData"
        :fit="true"
        :maxHeight="viewConfig.tableMaxHeight"
        show-overflow-tooltip
        table-layout="fixed"
        scrollbar-always-on
        @selection-change="onTableSelectRow"
        @sort-change="onTableSortChange"
      >
        <el-table-column v-if="viewConfig.table.sortable" type="selection" width="54" />
        <el-table-column v-for="field in fields" :align="field.valueAlign" :header-align="field.headerAlign"
          :label="field.label || field.prop" :prop="field.prop" :width="field.width" sortable="custom" />
        <el-table-column v-if="viewConfig.table.ctlButton" fixed="right" header-align="center" label="操作" width="120">
          <template #default="scope">
            <el-button v-for="btn in viewConfig.table.ctlButtons" :link="true" :size="btn.size" :type="btn.type"
              @click="onTableCtlButtonClick(btn.action, scope.row)">{{ btn.title }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-main v-if="viewConfig.footer.show" class="view-Footer">
      <el-button v-if="viewConfig.footer.deleteBtn" :disabled="selected.length === 0" icon="Delete" type="warning"
        @click="onDeleteBatchButtonClick">
        批量删除
      </el-button>
      <el-pagination v-if="viewConfig.footer.pagination.show" :layout="viewConfig.footer.pagination.layout"
        :page-size="viewConfig.footer.pagination.size" :page-sizes="viewConfig.footer.pagination.pageSizes"
        :total="dataTotal" background @size-change="onPageSizeChange" @current-change="onPageNumberChange" />
    </el-main>
  </div>


  <el-drawer v-model="drawer.edit.show" :title="drawer.edit.title" size="32%" :close-on-click-modal="false"
    :show-close="false" direction="rtl">
    <el-form :inline="false" :model="fields">
      <el-form-item v-for="field in fields" :key="field.prop" :label="field.label || field.prop">
        <el-input v-model="drawer.edit.data[field.prop]" :disabled="field.edit === 'false'" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer.edit.show = false">取消</el-button>
      <!-- :disabled="_.isEqual(drawer.edit.data, drawer.edit.template)" -->
      <el-button type="primary" @click="drawerSave" :loading="drawer.edit.saving">确定</el-button>
    </template>
  </el-drawer>

  <input
      ref="fileInput"
      type="file"
      accept=".csv"
      hidden
      v-show="false"
      style="display: none;"
      @change="handleFileSelect"
    />
</template>

<style lang="scss" scoped> 
  .view-main {
      height: 95%;
      width: 100%;

  }

  .view-Header {
      width: 100%;
      padding: 0;
      display: flex;
      flex-direction: row;
  }

  .view-SearchView {
      display: flex;
      flex-direction: row;
      padding: 6px;
      align-items: center;
      justify-content: flex-start;
  }

  .view-Buttons {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: flex-end;
      padding: 6px;

  }

  .view-Footer {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
  }

  .el-button {
      outline: none;
      box-shadow: none;
  }

</style>
