<script setup>
import { ref, watch } from 'vue'
import { addScannerApi, updateScannerApi } from '@/apis/MParser/scanner'
import { ElMessage } from 'element-plus'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  scannerId: {
    type: [Number, String],
    default: null
  },
  scannerInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])
const selfVisible = useVModel(props, 'visible', emit)

const formData = ref({
  NodeName: '',
  Port: 0,
  Status: 0,
  Switch: 0
})

const loading = ref(false)

// 监听scannerInfo变化，更新表单数据
watch(() => props.scannerInfo, (newVal) => {
  if (newVal) {
    formData.value = {
      ...formData.value,
      NodeName: newVal.NodeName || '',
      Port: newVal.Port || 0,
      Status: newVal.Status || 0,
      Switch: newVal.Switch || 0
    }
  }
}, { immediate: true })

const rules = {
  NodeName: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  Port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', message: '端口号必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0 || value > 65535) {
        callback(new Error('端口号必须在 0-65535 之间'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const formRef = ref(null)

const handleClose = () => {
  selfVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const submitData = {
      ...formData.value
    }

    if (props.scannerId) {
      submitData.ID = props.scannerId
      await updateScannerApi(submitData)
    } else {
      await addScannerApi(submitData)
    }

    ElMessage.success(`${props.scannerId ? '更新' : '添加'}成功`)
    emit('success')
    handleClose()
  } catch (error) {
    console.error(error)
    ElMessage.error(error.message || `${props.scannerId ? '更新' : '添加'}失败`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    :title="scannerId ? '编辑扫描器' : '添加扫描器'"
    v-model="selfVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="loading"
    >
      <el-form-item label="节点名称" prop="NodeName">
        <el-input v-model="formData.NodeName" placeholder="请输入节点名称" />
      </el-form-item>

      <el-form-item label="端口" prop="Port">
        <el-input-number
          v-model="formData.Port"
          :min="0"
          :max="65535"
          placeholder="请输入端口号"
        />
      </el-form-item>

      <el-form-item label="状态" prop="Status">
        <el-radio-group v-model="formData.Status">
          <el-radio-button :label="1">正常</el-radio-button>
          <el-radio-button :label="0">异常</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="开关" prop="Switch">
        <el-radio-group v-model="formData.Switch">
          <el-radio-button :label="1">开启</el-radio-button>
          <el-radio-button :label="0">关闭</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
