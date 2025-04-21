<template>
  <div>
    <div
      :class="['avatar-upload', `avatar-upload-${shape}`]"
      @click="handleClick"
    >
      <!-- 头像显示区域 -->
      <div class="avatar-content">
        <el-avatar :size="100" :src="modelValue">
          {{ getInitials }}
        </el-avatar>
      </div>
      <!-- 悬浮遮罩层 -->
      <div class="avatar-overlay">
        <div class="overlay-content">
          <el-icon class="camera-icon"><Camera /></el-icon>
          <span class="overlay-text">修改头像</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="更换头像"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleClose"
      draggable
      :modal-append-to-body="false"
      :append-to-body="true"
      class="avatar-dialog"
      destroy-on-close
      @close="handleClose"
    >
      <div class="cropper-container">
        <!-- 左侧裁剪区 -->
        <div class="cropper-left">
          <div class="image-preview">
            <img
              :src="imageData || defaultAvatar"
              alt="裁剪图片"
              ref="imageRef"
            />
          </div>
        </div>

        <!-- 右侧预览区 -->
        <div class="cropper-right">
          <div class="preview-section">
            <h4>预览</h4>
            <div class="preview-container">
              <div
                class="preview-box"
                :style="{
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%'
                }"
              ></div>
              <div class="preview-size">128 x 128</div>
            </div>
            <div class="preview-container">
              <div
                class="preview-box"
                :style="{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%'
                }"
              ></div>
              <div class="preview-size">64 x 64</div>
            </div>
            <div class="preview-container">
              <div
                class="preview-box"
                :style="{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%'
                }"
              ></div>
              <div class="preview-size">32 x 32</div>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <div class="left-tools">
          <el-button-group>
            <el-button @click="rotateImage(-90)">
              <el-icon><RefreshLeft /></el-icon>
              <span>向左旋转</span>
            </el-button>
            <el-button @click="zoomImage(0.1)">
              <el-icon><ZoomIn /></el-icon>
              <span>放大</span>
            </el-button>
            <el-button @click="zoomImage(-0.1)">
              <el-icon><ZoomOut /></el-icon>
              <span>缩小</span>
            </el-button>
            <el-button @click="rotateImage(90)">
              <el-icon><RefreshRight /></el-icon>
              <span>向右旋转</span>
            </el-button>
          </el-button-group>
        </div>
        <div class="right-tools">
          <el-button type="primary" plain @click="chooseImage"
            >选择图片</el-button
          >
          <el-button
            type="success"
            @click="uploadImage"
            :loading="uploading"
            :disabled="!imageData || uploading"
          >
            {{ uploading ? "上传中..." : "确认上传" }}
          </el-button>
        </div>
      </div>
    </el-dialog>

    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/bmp"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { handleAvatarUpload } from "@/apis/sys/user";
import {
  Camera,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut
} from "@element-plus/icons-vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ElMessage } from "element-plus";
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

// 定义属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  username: {
    type: String,
    default: ""
  },
  shape: {
    type: String,
    default: "round",
    validator: (val) => ["round", "default"].includes(val)
  },
  maxSize: {
    type: Number,
    default: 1024 // 默认1MB
  },
  uploadFunction: {
    type: Function,
    default: handleAvatarUpload
  }
});

// 定义事件
const emit = defineEmits(["success", "close"]);

// 默认头像
const defaultAvatar = "/src/assets/default-avatar.png";

// 组件状态
const dialogVisible = ref(false);
const uploading = ref(false);
const imageData = ref("");
const fileInput = ref(null);
const imageRef = ref(null);
let cropper = null;

// 计算头像文字
const getInitials = computed(() => {
  if (props.modelValue) return "";
  const username = props.username || "User";
  return username.charAt(0).toUpperCase();
});

// 点击头像
const handleClick = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 验证文件大小（5MB）
  const fileSize = file.size / 1024 / 1024; // 转为MB
  if (fileSize > 5) {
    ElMessage.warning("图片大小不能超过5MB！");
    return;
  }

  // 验证文件类型
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/bmp"];
  if (!validTypes.includes(file.type)) {
    ElMessage.warning("请选择 jpg、jpeg、png 或 bmp 格式的图片！");
    return;
  }

  // 读取文件
  const reader = new FileReader();
  reader.onload = (e) => {
    imageData.value = e.target.result;
    dialogVisible.value = true;
    nextTick(() => {
      initCropper();
    });
  };
  reader.readAsDataURL(file);

  // 重置input
  e.target.value = "";
};

// 初始化裁剪器
const initCropper = () => {
  if (cropper) {
    cropper.destroy();
  }
  nextTick(() => {
    cropper = new Cropper(imageRef.value, {
      aspectRatio: 1,
      viewMode: 1,
      preview: ".preview-box",
      background: false,
      autoCropArea: 0.8,
      cropBoxResizable: true,
      cropBoxMovable: true,
      dragMode: "move",
      movable: true,
      center: true,
      guides: true,
      highlight: false,
      modal: true,
      minCropBoxWidth: 100,
      minCropBoxHeight: 100,
      // 设置圆形裁剪框
      cropBoxShape: "round"
    });
  });
};

// 旋转图片
const rotateImage = (angle) => {
  if (cropper) {
    cropper.rotate(angle);
  }
};

// 缩放图片
const zoomImage = (ratio) => {
  if (cropper) {
    cropper.zoom(ratio);
  }
};

// 选择图片
const chooseImage = () => {
  fileInput.value.click();
};

// 确认上传
const uploadImage = async () => {
  if (!cropper) {
    ElMessage.warning("请先选择图片");
    return;
  }

  uploading.value = true;
  try {
    const canvas = cropper.getCroppedCanvas({
      width: 200,
      height: 200,
      imageSmoothingQuality: "high"
    });

    const base64Data = canvas.toDataURL("image/jpeg", 0.9);

    // 调用上传函数并获取返回的头像URL
    const res = await props.uploadFunction(base64Data);
    emit("success", res);
    handleClose();
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error(error.message || "上传失败，请重试");
  } finally {
    uploading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  // 重置状态
  imageData.value = "";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  emit("close");
};

// 组件销毁前清理
onBeforeUnmount(() => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});
</script>

<style scoped lang="scss">
.avatar-upload {
  width: 100px;
  height: 100px;
  border: none;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  overflow: hidden;

  &:hover {
    .avatar-overlay {
      transform: translateY(0);
    }
  }
}

.avatar-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .camera-icon {
    font-size: 32px;
    color: #fff;
    transition: transform 0.3s ease;
  }

  .overlay-text {
    color: #fff;
    font-size: 14px;
    user-select: none;
  }

  &:hover .camera-icon {
    transform: scale(1.1);
  }
}

.avatar-upload-round {
  .avatar-content {
    border-radius: 50%;
    overflow: hidden;
  }
  .avatar-overlay {
    border-radius: 50%;
  }
}

.avatar-upload-default {
  .avatar-content {
    border-radius: 8px;
    overflow: hidden;
  }
  .avatar-overlay {
    border-radius: 8px;
  }
}

.cropper-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: var(--el-bg-color);
}

.cropper-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .image-preview {
    width: 450px;
    height: 450px;
    background-color: var(--el-fill-color-blank);
    overflow: hidden;
    position: relative;
    border: 1px solid var(--el-border-color);

    img {
      display: block;
      max-width: 100%;
      height: auto;
    }
  }
}

.cropper-right {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 48px;

  .preview-section {
    flex: 1;
    h4 {
      margin: 0 0 16px;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  .preview-container {
    margin-bottom: 20px;
    text-align: center;

    .preview-box {
      margin: 0 auto 8px;
      border: 1px solid var(--el-border-color);
      overflow: hidden;
      background-color: var(--el-fill-color-blank);
    }

    .preview-size {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 32px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 5px;
  background-color: var(--el-bg-color);

  .left-tools {
    :deep(.el-button-group) {
      display: flex;
      gap: 8px;

      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 32px;
        padding: 0 12px;
      }
    }
  }

  .right-tools {
    display: flex;
    gap: 8px;

    .el-button {
      height: 32px;
      padding: 0 12px;
    }
  }
}

.avatar-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--el-bg-color);
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color);
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background-color: var(--el-bg-color);
  }
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.cropper-view-box),
:deep(.cropper-face) {
  border-radius: 50%;
}

:deep(.cropper-view-box) {
  outline: 1px solid var(--el-color-primary);
  outline-color: var(--el-color-primary);
}

:deep(.cropper-point) {
  background-color: var(--el-color-primary);
  width: 8px;
  height: 8px;
  opacity: 0.75;

  &.point-e,
  &.point-n,
  &.point-w,
  &.point-s {
    width: 8px;
    height: 8px;
  }

  &.point-ne,
  &.point-nw,
  &.point-se,
  &.point-sw {
    width: 8px;
    height: 8px;
  }
}

:deep(.cropper-line) {
  background-color: var(--el-color-primary);
}
</style>
