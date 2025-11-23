<!-- src/components/SongInput.vue -->
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { SongStatus } from '../types';

const props = defineProps<{
  songs: SongStatus[];
}>();

const emit = defineEmits(['add-song', 'download', 'delete-song', 'reorder-songs', 'preview-song']);

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

const draggedIndex = ref<number | null>(null);

const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Set a transparent image or just let the browser handle the ghost image
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (index: number) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    emit('reorder-songs', draggedIndex.value, index);
  }
  draggedIndex.value = null;
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
          <div class="main-card">
            <div class="input-group">
              <input ref="inputRef" v-model="newSongName" placeholder="Enter song name and press Enter..."
                @keyup.enter="handleAdd" class="song-input" />
              <button @click="handleAdd" class="add-btn" :disabled="!newSongName.trim()">
                <span>Add</span>
              </button>
            </div>

            <div v-if="props.songs.length > 0" class="songs-section">

              <div class="songs-list">
                <div v-for="(song, index) in props.songs" :key="song.id" class="song-item"
                  :class="[getStatusClass(song.status), { 'dragging': draggedIndex === index }]" draggable="true"
                  @dragstart="onDragStart($event, index)" @dragover="onDragOver" @drop="onDrop(index)">
                  <div class="drag-handle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                  <div class="song-info">
                    <span class="song-icon">{{ getStatusIcon(song.status) }}</span>
                    <div class="song-details">
                      <span class="song-name">{{ song.name }}</span>
                      <span v-if="song.message" class="song-message">{{ song.message }}</span>
                    </div>
                  </div>
                  <div v-if="['searching', 'downloading'].includes(song.status)" class="spinner"></div>
                  <button v-if="song.status === 'downloaded'" @click="$emit('preview-song', song.id)"
                    class="action-btn preview-btn" title="Preview PDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button @click="$emit('delete-song', song.id)" class="action-btn delete-btn" title="Remove song">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <button @click="$emit('download')" class="download-btn-bottom" :disabled="!hasDownloadableSongs()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>

            <div v-else class="empty-state-inline">
              <div class="empty-icon">📝</div>
              <p>No songs added yet</p>
              <span class="empty-hint">Start by entering a song name above</span>
            </div>
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

.main-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.main-card h2 {
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
  background-color: white;
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

.songs-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f7fafc;
}

.songs-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.songs-header {
  margin-bottom: 1rem;
}

.download-btn-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 1.5rem;
  padding: 14px 20px;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn-bottom:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.download-btn-bottom:disabled {
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
  cursor: grab;
}

.song-item:active {
  cursor: grabbing;
}

.song-item.dragging {
  opacity: 0.5;
  background: #e2e8f0;
  border-style: dashed;
}

.drag-handle {
  display: flex;
  align-items: center;
  color: #a0aec0;
  margin-right: 12px;
  cursor: grab;
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

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 4px;
}

.delete-btn:hover {
  background: #fed7d7;
  color: #e53e3e;
}

.preview-btn:hover {
  background: #bee3f8;
  color: #3182ce;
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

.empty-state-inline {
  margin-top: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  background: #f7fafc;
  border-radius: 12px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-state-inline p {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-hint {
  color: #718096;
  font-size: 0.875rem;
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

  .song-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
