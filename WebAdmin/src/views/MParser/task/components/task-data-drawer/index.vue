<script setup>
/**
 * 任务数据弹窗
 */

import { ref, reactive, computed, watch } from "vue";
import { getTaskDataApi } from "@/apis/MParser/task";

const show = ref(false);

const $props = defineProps({
    taskId: {
        default: null
    }
});

const $emits = defineEmits(['close']);

const loading = ref(false);
const downloading = ref(false);

const data = ref([]);
const page = ref(1);
const pageSize = ref(50);
const total = ref(0);

const filterTemp = reactive({
    field: null,
    value: null
});

const fields = computed(() => {
    let _fileds = [];
    if (data.value.length > 0) {
        for (const key in data.value[0]) {
            _fileds.push({
                prop: key,
                label: key,
                valueAlign: 'center',
                headerAlign: 'center',
                // width: 120
            });
        }
    }

    return _fileds;
});

const getData = async () => {
    if (loading.value) return void 0;
    loading.value = true;

    try {
        let _search = {};
        if (filterTemp.field) {
            _search.field = filterTemp.field;
            _search.value = filterTemp.value;
        }

        const response = await getTaskDataApi(
            $props.taskId,
            {
                page: page.value,
                page_size: pageSize.value,
                ..._search
            }
        );
        data.value = response.data.list || [];
        page.value = response.data.page || 1;
        pageSize.value = response.data.page_size || 50;
        total.value = response.data.total || 0;
    } finally {
        loading.value = false;
    }
};

const onSearchValueChange = () => {
    refresh();
};

const onSearchButtonClick = () => {
    refresh();
};

const handleClose = () => {
    $emits('close');
    show.value = false;
    loading.value = false;
    downloading.value = false;
    data.value = [];
    page.value = 1;
    pageSize.value = 50;
    total.value = 0;
};

const onPageSizeChange = (newPageSize) => {
    pageSize.value = newPageSize;
    getData();
};

const onPageNumberChange = (newPageSize) => {
    pageSize.value = newPageSize;
    getData();
};

const refresh = () => {
    getData();
};

const downloadData = () => {
    window.open(
        `/api/task/${$props.taskId}/data/download`,
    );
}

watch(
    () => $props.taskId,
    (newVal) => {
        if (!newVal || 0 >= newVal) {
            show.value = false;
            return void 0;
        }

        show.value = true;
        getData();
    },
    {
        immediate: true
    }
);
</script>

<template>
    <el-drawer v-model="show" title="任务数据" direction="rtl" size="100%" @close="handleClose">
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
                    <el-tooltip :disabled="loading" content="刷新" effect="dark" placement="top-start">
                        <el-button icon="Refresh" type="success" @click="refresh()" />
                    </el-tooltip>
                    <el-tooltip :disabled="downloading" content="导出当前数据" effect="dark" placement="top-start">
                        <el-button :loading="downloading" color="#626aef" icon="Download" @click="downloadData()" />
                    </el-tooltip>
                </el-main>
            </el-main>

            <el-main class="view-Table">
                <el-table
                    :border="true"
                    :data="data"
                    :fit="true"
                    :maxHeight="8200"
                    showOverflowTooltip
                    tableLayout="fixed"
                    scrollbar-always-on
                >
                    <el-table-column
                        v-for="field in fields"
                        :align="field.valueAlign"
                        :header-align="field.headerAlign"
                        :label="field.label || field.prop"
                        :prop="field.prop"
                        :width="field.width"
                        sortable="custom"
                    />
                </el-table>
            </el-main>
            <el-main class="view-Footer">
                <el-pagination
                    layout="total, sizes, prev, pager, next, jumper"
                    :pageSize="50"
                    :pageSizes="[50, 100, 200, 300, 400, 500]"
                    :total="total"
                    background
                    @sizeChange="onPageSizeChange"
                    @currentChange="onPageNumberChange"
                />
            </el-main>
        </div>
    </el-drawer>
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
