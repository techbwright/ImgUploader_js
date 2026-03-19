<script setup>
import axios from 'axios';
import { onMounted, onUnmounted, ref } from 'vue';
const baseUrl = 'http://localhost:3001';

const message = ref('');
const messages = ref([]);
const previewUrl = ref('');
const previewUrls = ref([]);
const imgUploadPath = ref('');
const imgUploadPaths = ref([]);
const images = ref([]);

/*** Handle single image uploads ***/
const onFileChangeSingle = (event) => {
  const file = event.target.files[0];
  if (file) {
    previewUrl.value = URL.createObjectURL(file);
  }
};

const removeImageSingle = () => {
  URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
//Clear the file input value to allow re-uploading the same image if desired
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.value = '';
  }
  imgUploadPath.value = '';
  message.value = '';
};

const upLoadSingleImage = async () => {
  const form = document.getElementById('formSingle');
  const formData = new FormData(form);

  try {
    const response = await axios.post('http://localhost:3001/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    imgUploadPath.value = response.data.imageUrl;
    message.value = `Image Uploaded To:\n${imgUploadPath.value}`;
    console.log('Upload successful');
  } 
  catch (error) {
    message.value = 'Upload failed';
    console.log('Upload failed:', error);
  }
};

/*** Handle multiple image uploads ***/
const onFileChangeMultiple = (event) => {
  images.value = Array.from(event.target.files);
  
  //Preview the selected images before uploading
  previewUrls.value = images.value.map(file => URL.createObjectURL(file));
};  

const removeImages = (index) => {
  //FOR LOOP TO REVOKE ALL OBJECT URLS IN THE PREVIEW URLS ARRAY
  for(let i = 0; i < previewUrls.value.length; i++){
    URL.revokeObjectURL(previewUrls.value[i]);
  } 
  previewUrls.value = [];
  images.value = [];
  const fileInput = document.querySelector('input[type="file"][multiple]');
  if (fileInput) {
    fileInput.value = '';
  }   
  imgUploadPaths.value = [];  
  messages.value = [];
};  

const uploadMultipleImages = async () => {
  const form = document.getElementById('formMultiple');
  const formData = new FormData(form);

  try {
    const response = await axios.post('http://localhost:3001/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    imgUploadPaths.value = response.data.imageUrls.map(path => path);
    messages.value = `Images Uploaded To:\n${imgUploadPaths.value}`;
    console.log('Upload successful');
  } catch (error) {
    messages.value = 'Upload failed';
    console.log('Upload failed:', error);
  }
};  

onUnmounted(() => {
  // Revoke object URLs to free memory
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrls.value.forEach(url => URL.revokeObjectURL(url));
  
  images.value = [];
  imgUploadPath.value = '';
  imgUploadPaths.value = [];  
  message.value = '';
  messages.value = [];
});  
</script>
<template>
<!DOCTYPE html>
<html lang="en">
<body>
  <div class="container">
    
    <!-- Form for single image upload -->
    <form id="formSingle" @submit.prevent="upLoadSingleImage()" style="border: 2px solid red; border-radius: 25px; padding: 20px; margin-bottom: 40px;">
      <h2 style="text-align: center;">This Form Uploads a Single Image</h2>
      <input @change="onFileChangeSingle" type="file" name="image" accept="image/*" style="padding: 15px; width: 100%;" required />
      <div style="text-align: center;">
        <button type="submit" style="margin: 15px;">Upload Image</button>
      </div>
      
      <div v-if="previewUrl" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <p>Preview: Image To Be Uploaded</p>
        <img :src="previewUrl" alt="Image Preview" style="max-width: 150px;" /> 
        <button @click="removeImageSingle" style="max-width: 150px;">Remove Image</button>
      </div>
      <div v-if="imgUploadPath" style="white-space: pre-line; text-align: center;">
      {{ message }}
      </div>
    </form>

    <!-- Form for multiple image upload -->
    <form id="formMultiple" @submit.prevent="uploadMultipleImages()" style="border: 2px solid blue; border-radius: 25px; padding: 20px;">
      <h2 style="text-align: center;">This Form Uploads Multiple Images</h2>
      <input ref="images" type="file" multiple accept="image/*" @change="onFileChangeMultiple" name="images" style="padding: 15px; width: 100%;" required />
      <div style="text-align: center;">
        <button type="submit" style="margin: 15px;">Upload Images</button>
      </div>
      
      <div v-if="previewUrls.length > 0" style="text-align: center;">         
        <p>Preview: Images To Be Uploaded</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: center;">
          <div v-for="(url, index) in previewUrls" :key="index">
            <img :src="url" alt="Image Preview" style="max-width: 100px; margin: 10px;" />
          </div>  
        </div>
        <button @click="removeImages(index)" style="margin: 10px;">Remove All</button>
      </div>
      <div v-if="imgUploadPaths.length > 0" style="white-space: pre-line;">
<div>
      {{ messages }}
      </div>
      </div>
    </form>  

  </div>
</body>
</html>

</template>
<style scoped>

    
    body {
      display: flex;           
      justify-content: center; 
      align-items: center;     
    }

    /* Wrap the forms */
    .container {
      width: 640px;
      max-width: 800px; 
      padding: 20px;
      box-sizing: border-box;
    }
    
    
</style>