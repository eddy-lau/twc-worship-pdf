<!-- src/components/SongInput.vue -->
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { SongStatus } from '../types';

const props = defineProps<{
  songs: SongStatus[];
}>();

const emit = defineEmits(['add-song', 'download']);

const newSongName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const handleAdd = () => {
  const name = newSongName.value.trim();
  if (name) {
    emit('add-song', name);
    newSongName.value = '';
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'searching': return '🔍';
    case 'found': return '📄';
    case 'downloading': return '⬇️';
    case 'downloaded': return '✅';
    case 'not-found': return '❌';
    case 'error': return '⚠️';
    default: return '⏳';
  }
};

const getStatusClass = (status: string) => {
  return `status-${status}`;
};

const hasDownloadableSongs = () => {
  return props.songs.some(s => s.status === 'downloaded');
};
</script>

<template>
  <div class="main-page">
    <div class="container">
      <header class="header">
        <div class="header-content">
          <div class="title-section">
            <h1>🎵 詩歌樂譜製作器</h1>
            <p class="subtitle">Worship Song Sheet Generator</p>
          </div>
        </div>
      </header>

      <div class="content">
        <div class="input-section">
          <div class="input-card">
            <h2>Add Songs</h2>
            <div class="input-group">
              <input ref="inputRef" v-model="newSongName" placeholder="Enter song name and press Enter..."
                @keyup.enter="handleAdd" class="song-input" />
              <button @click="handleAdd" class="add-btn" :disabled="!newSongName.trim()">
                <span>Add</span>
              </button>
            </div>
          </div>

          <div v-if="props.songs.length > 0" class="songs-card">
            <div class="songs-header">
              <h3>Songs ({{ props.songs.length }})</h3>
              <button @click="$emit('download')" class="download-btn" :disabled="!hasDownloadableSongs()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>

            <div class="songs-list">
              <div v-for="song in props.songs" :key="song.id" class="song-item" :class="getStatusClass(song.status)">
                <div class="song-info">
                  <span class="song-icon">{{ getStatusIcon(song.status) }}</span>
                  <div class="song-details">
                    <span class="song-name">{{ song.name }}</span>
                    <span v-if="song.message" class="song-message">{{ song.message }}</span>
                  </div>
                </div>
                <div v-if="['searching', 'downloading'].includes(song.status)" class="spinner"></div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">📝</div>
            <p>No songs added yet</p>
            <span class="empty-hint">Start by entering a song name above</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  padding: 2rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.content {
  padding-bottom: 2rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-card,
.songs-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.input-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  gap: 12px;
}

.song-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  color: #2d3748;
  transition: all 0.2s;
  outline: none;
}

.song-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-btn {
  padding: 0 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.songs-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.songs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f7fafc;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #cbd5e0;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #cbd5e0;
  transition: all 0.2s;
}

.song-item:hover {
  background: #edf2f7;
}

.song-item.status-downloaded {
  border-left-color: #48bb78;
  background: #f0fff4;
}

.song-item.status-not-found {
  border-left-color: #f56565;
  background: #fff5f5;
}

.song-item.status-error {
  border-left-color: #ed8936;
  background: #fffaf0;
}

.song-item.status-searching,
.song-item.status-downloading {
  border-left-color: #4299e1;
  background: #ebf8ff;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.song-icon {
  font-size: 1.5rem;
}

.song-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.song-message {
  font-size: 0.875rem;
  color: #718096;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-hint {
  color: #718096;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .header {
    padding: 1.5rem 0;
  }

  .title-section h1 {
    font-size: 1.5rem;
  }

  .input-group {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
  }

  .songs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }

  .song-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
