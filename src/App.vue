<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import LoginView from './components/LoginView.vue';
import SongInput from './components/SongInput.vue';
import { searchPdf, downloadFile } from './services/drive';
import { mergePdfs, downloadPdf } from './services/pdf';

type ViewState = 'login' | 'main';
const currentView = ref<ViewState>('login');

import type { SongStatus } from './types';

const songs = ref<SongStatus[]>([]);
let nextId = 0;

const handleLoginSuccess = () => {
  currentView.value = 'main';
};

const processSong = async (songId: number) => {
  const index = songs.value.findIndex(s => s.id === songId);
  if (index === -1) return;

  const song = songs.value[index]!;

  try {
    // Search
    song.status = 'searching';
    const file = await searchPdf(song.name);

    if (!file) {
      song.status = 'not-found';
      song.message = 'Not found';
      return;
    }

    song.status = 'found';
    song.fileId = file.id;
    song.message = `Found: ${file.name}`;

    // Download
    song.status = 'downloading';
    const buffer = await downloadFile(file.id);
    song.data = buffer;
    song.status = 'downloaded';
    song.message = 'Ready';

  } catch (error) {
    song.status = 'error';
    song.message = error instanceof Error ? error.message : 'Unknown error';
  }
};

const handleAddSong = (name: string) => {
  const song: SongStatus = {
    id: nextId++,
    name,
    status: 'pending'
  };
  songs.value.push(song);
  processSong(song.id);
};

const handleDeleteSong = (id: number) => {
  songs.value = songs.value.filter(s => s.id !== id);
};

const handleReorderSongs = (fromIndex: number, toIndex: number) => {
  const item = songs.value.splice(fromIndex, 1)[0];
  if (item) {
    songs.value.splice(toIndex, 0, item);
  }
};

const handlePreviewSong = (id: number) => {
  const song = songs.value.find(s => s.id === id);
  if (song && song.data) {
    const blob = new Blob([song.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

const handleDownload = async () => {
  const pdfBuffers = songs.value
    .filter(s => s.status === 'downloaded' && s.data)
    .map(s => s.data!);

  if (pdfBuffers.length > 0) {
    try {
      const mergedPdf = await mergePdfs(pdfBuffers);
      downloadPdf(mergedPdf, '詩歌.pdf');
    } catch (error) {
      console.error('Merge error:', error);
      alert('Failed to merge PDFs');
    }
  } else {
    alert('No songs ready to download');
  }
};
</script>

<template>
  <main>
    <LoginView v-if="currentView === 'login'" @login-success="handleLoginSuccess" />
    <SongInput v-else-if="currentView === 'main'" :songs="songs" @add-song="handleAddSong"
      @delete-song="handleDeleteSong" @reorder-songs="handleReorderSongs" @preview-song="handlePreviewSong"
      @download="handleDownload" />
  </main>
</template>

<style>
/* Global Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
