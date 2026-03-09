<script setup>
import axios from 'axios';
import { onUnmounted, ref } from 'vue';
const baseUrl = 'http://localhost:3001';
const message = ref('');
const messages = ref('');
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
  previewUrl.value = '';
//Clear the file input value to allow re-uploading the same image if desired
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.value = '';
  }
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
  URL.revokeObjectURL(previewUrls.value[index]);
  //previewUrls.value.splice(index, 1);
  previewUrls.value = [];
  images.value = [];
  const fileInput = document.querySelector('input[type="file"][multiple]');
  if (fileInput) {
    fileInput.value = '';
  }   
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

    imgUploadPaths.value = response.data.imageUrls;
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
});  
</script>
<template>
  <!--Form for single image upload-->
   <form id="formSingle" @submit.prevent="upLoadSingleImage()" style="border: 1px solid red; margin-bottom: 40px;">
  <h2>This Form Uploads a Single Image</h2>
      <input @change="onFileChangeSingle" type="file" name="image" accept="image/*" style="padding: 15px;" required />
      <button type="submit" value="Upload Image" style="margin: 15px;">Upload Image</button>
      <div>
        
<div v-if="previewUrl" style="display: flex; flex-direction: column; flex-wrap: wrap; gap: 10px;">
  <p>Preview: Image To Be Uploaded</p>
          <img :src="previewUrl" alt="Image Preview" style="max-width: 150px; margin: 15px;" /> 
          <button @click="removeImageSingle" style="max-width: 150px; margin: 15px;">Remove Image</button>
      </div>
      </div>
      {{ message }}
      <div v-if="imgUploadPath">
        <P>Path To The Uploaded Image:</P>
        {{ imgUploadPath }}
     <br/>
     <img :src="`${baseUrl}${imgUploadPath}`" alt="Uploaded Image" style="max-width: 200px; margin-top: 10px;" />   
      </div>
   </form>

    <!--Form for multiple image upload-->
    <form id="formMultiple" @submit.prevent="uploadMultipleImages()" style="border: 1px solid blue;">
  <h2>This Form Uploads Multiple Images</h2>
      <input ref="images" type="file" multiple accept="image/*" @change="onFileChangeMultiple"name="images" style="padding: 15px;" required />
      <button type="submit" value="Upload Images" style="margin: 15px;">Upload Images</button>
      <div>
        <div v-if="previewUrls.length > 0">         
          <p>Preview: Images To Be Uploaded</p>
          <br/>
          <div v-if="previewUrls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
          <div v-for="(url, index) in previewUrls" :key="index">
            <img :src="url" alt="Image Preview" style="max-width: 150px; margin: 24px;" />
          </div>  
        </div>
          <div style="display:flex; flex-direction: column; align-items: center;">
          <button @click="removeImages(index)" style="max-width: 150px; margin: 10px;">Remove Images</button>
          </div>
       </div>
       <p>{{ messages }}</p>
      </div>  
      <div v-if="imgUploadPaths.length > 0">
        <p>Path To Uploaded Images: </p>
        <p>{{ imgUploadPaths }}</p>
     <br/>
     <div v-if="imgUploadPaths" style="display: flex; flex-wrap: wrap; gap: 10px;">
          <div v-for="(url, index) in imgUploadPaths" :key="index">
            <img :src="`${baseUrl}${url}`" alt="Uploaded Image" style="max-width: 200px;" />
          </div>
       </div>
      </div>
   </form>  
</template>