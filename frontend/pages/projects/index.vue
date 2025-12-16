<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Projects</h1>
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            @click="viewMode = 'table'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              viewMode === 'table' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            ]"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Table
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            ]"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            @click="viewMode = 'kanban'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              viewMode === 'kanban' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            ]"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </button>
        </div>
        <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">
          <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </div>

    <!-- Compact Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search projects..." 
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        </div>

        <!-- Product Filter -->
        <select v-model="filters.product_id" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
          <option value="">All Products</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>

        <!-- Status Filter -->
        <select v-model="filters.status" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
          <option value="">All Statuses</option>
          <option v-for="status in projectStatuses" :key="status.slug" :value="status.slug">
            {{ status.name }}
          </option>
        </select>

        <!-- Owner Filter -->
        <select v-model="filters.owner_id" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
          <option value="">All Owners</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.full_name || user.email }}
          </option>
        </select>

        <!-- Sort By (table view only) -->
        <select v-if="viewMode === 'table'" v-model="sortBy" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
          <option value="name">Sort: Name</option>
          <option value="priority_order">Sort: Priority ↕</option>
          <option value="start_date">Sort: Start Date</option>
          <option value="target_end_date">Sort: End Date</option>
        </select>

        <!-- Clear -->
        <button @click="clearFilters" class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">
          Clear
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProjects.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-4">No projects found</p>
      <button v-if="canCreate" @click="showCreateModal = true" class="btn-primary">Create Your First Project</button>
    </div>

    <!-- TABLE VIEW -->
    <div v-else-if="viewMode === 'table'" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <!-- Priority Mode Banner -->
      <div v-if="sortBy === 'priority_order'" class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
        <span class="text-sm text-blue-700 dark:text-blue-300">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Drag rows to reorder priority
        </span>
        <span v-if="savingPriorities" class="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Saving...
        </span>
      </div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th v-if="sortBy === 'priority_order'" class="w-10 px-2 py-3"></th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" @click="toggleSort('name')">
              Project Name
              <span v-if="sortBy === 'name'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teams</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" @click="toggleSort('start_date')">
              Start Date
              <span v-if="sortBy === 'start_date'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" @click="toggleSort('target_end_date')">
              End Date
              <span v-if="sortBy === 'target_end_date'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Labels</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Priority View: Show prioritized and unprioritized in separate sections -->
          <template v-if="sortBy === 'priority_order'">
            <!-- Prioritized Section Header - always visible, acts as drop zone -->
            <tr 
              class="bg-blue-50 dark:bg-blue-900/20 transition-colors"
              :class="{ 'bg-blue-100 dark:bg-blue-800/30 ring-2 ring-blue-400 ring-inset': dragOverSection === 'prioritized' && dragOverIndex === 0 }"
              @dragover.prevent="onPrioritizedHeaderDragOver"
              @drop.prevent="onPrioritizedHeaderDrop"
            >
              <td :colspan="10" class="px-6 py-3">
                <div class="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Prioritized ({{ prioritizedProjects.length }})
                  <span v-if="draggingProject2 && dragOverSection === 'prioritized' && dragOverIndex === 0" class="text-xs text-blue-500 font-normal ml-2">
                    ↓ Drop here to set as #1 priority
                  </span>
                  <span v-else-if="prioritizedProjects.length === 0" class="text-xs text-blue-500 font-normal ml-2">
                    Drag projects here to prioritize them
                  </span>
                </div>
              </td>
            </tr>
            
            <!-- Prioritized Projects Section -->
            <tr 
              v-for="(project, index) in prioritizedProjects" 
              :key="project.id" 
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-grab active:cursor-grabbing"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': dragOverIndex === index && dragOverSection === 'prioritized' }"
              draggable="true"
              @dragstart="onTableDragStart($event, project)"
              @dragend="onTableDragEnd"
              @dragover.prevent="onTableDragOver(index)"
              @dragleave="onTableDragLeave"
              @drop.prevent="onTableDrop(index)"
            >
              <td class="w-10 px-2 py-4 cursor-move text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {{ index + 1 }}
                  </span>
                  <div>
                    <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {{ project.name }}
                    </NuxtLink>
                    <p v-if="project.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ project.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ project.product?.name || '-' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="getStatusStyle(project.status)">{{ getStatusLabel(project.status) }}</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.teams?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pt in project.teams.slice(0, 2)" :key="pt.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="pt.team?.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'">{{ pt.team?.name }}</span>
                  <span v-if="project.teams.length > 2" class="text-xs text-gray-500">+{{ project.teams.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.total_tasks > 0" class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-20">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: project.task_progress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ project.completed_tasks }}/{{ project.total_tasks }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">No tasks</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pl in project.labels.slice(0, 2)" :key="pl.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }">{{ pl.label?.name }}</span>
                  <span v-if="project.labels.length > 2" class="text-xs text-gray-500">+{{ project.labels.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openDateEditor(project)" class="text-gray-400 hover:text-blue-600" title="Edit Timeline"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                  <button @click="openLabelEditor(project)" class="text-gray-400 hover:text-purple-600" title="Manage Labels"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg></button>
                  <button @click="editProject(project)" class="text-gray-400 hover:text-green-600" title="Edit Project"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button @click="deleteProject(project)" class="text-gray-400 hover:text-red-600" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </td>
            </tr>
            
            <!-- Drop zone at end of prioritized list -->
            <tr 
              v-if="draggingProject2 && prioritizedProjects.length > 0"
              class="transition-colors"
              :class="{ 'bg-blue-50 dark:bg-blue-900/20': dragOverIndex === prioritizedProjects.length && dragOverSection === 'prioritized' }"
              @dragover.prevent="onTableDragOver(prioritizedProjects.length)"
              @drop.prevent="onTableDrop(prioritizedProjects.length)"
            >
              <td :colspan="10" class="px-6 py-2 text-center text-sm text-blue-600 dark:text-blue-400 border-2 border-dashed border-blue-300 dark:border-blue-700">
                ↓ Drop here to add at end of list
              </td>
            </tr>
            
            <!-- Unprioritized Section Header -->
            <tr 
              v-if="unprioritizedProjects.length > 0 || draggingProject2" 
              class="bg-gray-100 dark:bg-gray-700 transition-colors"
              :class="{ 'bg-yellow-100 dark:bg-yellow-900/30': dragOverSection === 'unprioritized' }"
              @dragover.prevent="onUnprioritizedDragOver"
              @drop.prevent="onUnprioritizedDrop"
            >
              <td :colspan="10" class="px-6 py-3">
                <div class="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Not Yet Prioritized ({{ unprioritizedProjects.length }})
                  <span class="text-xs text-gray-500 font-normal ml-2">
                    {{ draggingProject2 ? '↓ Drop here to deprioritize' : 'Drag to the section above to set priority' }}
                  </span>
                </div>
              </td>
            </tr>
            
            <!-- Unprioritized Projects -->
            <tr 
              v-for="project in unprioritizedProjects" 
              :key="'unprioritized-' + project.id" 
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 cursor-grab active:cursor-grabbing"
              :class="{ 'bg-yellow-50 dark:bg-yellow-900/20': dragOverSection === 'unprioritized' }"
              draggable="true"
              @dragstart="onTableDragStart($event, project)"
              @dragend="onTableDragEnd"
              @dragover.prevent="onUnprioritizedDragOver"
              @drop.prevent="onUnprioritizedDrop"
            >
              <td class="w-10 px-2 py-4 cursor-move text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-400 text-xs">
                    -
                  </span>
                  <div>
                    <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {{ project.name }}
                    </NuxtLink>
                    <p v-if="project.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ project.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{{ project.product?.name || '-' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="getStatusStyle(project.status)">{{ getStatusLabel(project.status) }}</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.teams?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pt in project.teams.slice(0, 2)" :key="pt.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="pt.team?.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'">{{ pt.team?.name }}</span>
                  <span v-if="project.teams.length > 2" class="text-xs text-gray-500">+{{ project.teams.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.total_tasks > 0" class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-20">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: project.task_progress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ project.completed_tasks }}/{{ project.total_tasks }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">No tasks</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pl in project.labels.slice(0, 2)" :key="pl.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }">{{ pl.label?.name }}</span>
                  <span v-if="project.labels.length > 2" class="text-xs text-gray-500">+{{ project.labels.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openDateEditor(project)" class="text-gray-400 hover:text-blue-600" title="Edit Timeline"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                  <button @click="openLabelEditor(project)" class="text-gray-400 hover:text-purple-600" title="Manage Labels"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg></button>
                  <button @click="editProject(project)" class="text-gray-400 hover:text-green-600" title="Edit Project"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button @click="deleteProject(project)" class="text-gray-400 hover:text-red-600" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </td>
            </tr>
            
            <!-- Completed Section Header -->
            <tr v-if="completedProjects.length > 0" class="bg-green-50 dark:bg-green-900/20">
              <td :colspan="10" class="px-6 py-3">
                <div class="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed ({{ completedProjects.length }})
                </div>
              </td>
            </tr>
            
            <!-- Completed Projects -->
            <tr 
              v-for="project in completedProjects" 
              :key="'completed-' + project.id" 
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-green-50/30 dark:bg-green-900/10 opacity-75"
            >
              <td class="w-10 px-2 py-4 text-gray-300">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-xs">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      {{ project.name }}
                    </NuxtLink>
                    <p v-if="project.description" class="text-sm text-gray-400 dark:text-gray-500 truncate max-w-xs">{{ project.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{{ project.product?.name || '-' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="getStatusStyle(project.status)">{{ getStatusLabel(project.status) }}</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.teams?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pt in project.teams.slice(0, 2)" :key="pt.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium opacity-60" :class="pt.team?.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'">{{ pt.team?.name }}</span>
                  <span v-if="project.teams.length > 2" class="text-xs text-gray-500">+{{ project.teams.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">
                <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">
                <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.total_tasks > 0" class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-20">
                    <div class="bg-green-500 h-2 rounded-full" :style="{ width: project.task_progress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ project.completed_tasks }}/{{ project.total_tasks }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">No tasks</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pl in project.labels.slice(0, 2)" :key="pl.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium opacity-60" :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }">{{ pl.label?.name }}</span>
                  <span v-if="project.labels.length > 2" class="text-xs text-gray-500">+{{ project.labels.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openDateEditor(project)" class="text-gray-400 hover:text-blue-600" title="Edit Timeline"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                  <button @click="openLabelEditor(project)" class="text-gray-400 hover:text-purple-600" title="Manage Labels"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg></button>
                  <button @click="editProject(project)" class="text-gray-400 hover:text-green-600" title="Edit Project"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button @click="deleteProject(project)" class="text-gray-400 hover:text-red-600" title="Delete"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </td>
            </tr>
          </template>
          
          <!-- Regular View (non-priority sorting) -->
          <template v-else>
            <tr 
              v-for="(project, index) in sortedProjects" 
              :key="project.id" 
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-6 py-4">
                <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                  {{ project.name }}
                </NuxtLink>
                <p v-if="project.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ project.description }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ project.product?.name || '-' }}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="getStatusStyle(project.status)">
                  {{ getStatusLabel(project.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.teams?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="pt in project.teams.slice(0, 2)" :key="pt.id" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="pt.team?.is_agency_team ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'">{{ pt.team?.name }}</span>
                  <span v-if="project.teams.length > 2" class="text-xs text-gray-500">+{{ project.teams.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.total_tasks > 0" class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-20">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: project.task_progress + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ project.completed_tasks }}/{{ project.total_tasks }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">No tasks</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="pl in project.labels.slice(0, 2)"
                    :key="pl.id"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }"
                  >
                    {{ pl.label?.name }}
                  </span>
                  <span v-if="project.labels.length > 2" class="text-xs text-gray-500">+{{ project.labels.length - 2 }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openDateEditor(project)" class="text-gray-400 hover:text-blue-600" title="Edit Timeline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button @click="openLabelEditor(project)" class="text-gray-400 hover:text-purple-600" title="Manage Labels">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </button>
                  <button @click="editProject(project)" class="text-gray-400 hover:text-green-600" title="Edit Project">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteProject(project)" class="text-gray-400 hover:text-red-600" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- GRID VIEW -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in sortedProjects" 
        :key="project.id" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span v-if="project.product" class="text-xs text-blue-600 dark:text-blue-400 font-medium">{{ project.product.name }}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :style="getStatusStyle(project.status)">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>
            <NuxtLink :to="`/projects/${project.id}`" class="text-lg font-bold hover:text-blue-600 dark:hover:text-blue-400">
              {{ project.name }}
            </NuxtLink>
          </div>
          <div class="relative">
            <button @click="toggleMenu(project.id)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
            <div v-if="activeMenu === project.id" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              <button @click="openDateEditor(project); activeMenu = null" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Edit Timeline
              </button>
              <button @click="openLabelEditor(project); activeMenu = null" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Manage Labels
              </button>
              <button @click="editProject(project)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Project
              </button>
              <button @click="deleteProject(project)" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{{ project.description || 'No description' }}</p>

        <!-- Timeline -->
        <div v-if="project.start_date || project.target_end_date" class="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span v-if="project.start_date">{{ formatDate(project.start_date) }}</span>
          <span v-if="project.start_date && project.target_end_date"> → </span>
          <span v-if="project.target_end_date">{{ formatDate(project.target_end_date) }}</span>
        </div>

        <!-- Progress -->
        <div v-if="project.total_tasks > 0" class="mb-3">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-500">Progress</span>
            <span class="font-medium">{{ project.completed_tasks }}/{{ project.total_tasks }} tasks</span>
          </div>
          <div class="bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div class="bg-blue-600 h-1.5 rounded-full transition-all" :style="{ width: project.task_progress + '%' }"></div>
          </div>
        </div>

        <!-- Labels -->
        <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="pl in project.labels"
            :key="pl.id"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }"
          >
            {{ pl.label?.name }}
          </span>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex items-center justify-between text-sm">
          <span class="text-gray-500">{{ project.owner?.full_name || 'Unassigned' }}</span>
          <NuxtLink :to="`/tasks?project_id=${project.id}`" class="text-blue-600 hover:text-blue-700">
            View Tasks →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- KANBAN VIEW -->
    <div v-else-if="viewMode === 'kanban'" class="flex gap-4 overflow-x-auto pb-4">
      <div 
        v-for="status in kanbanStatuses" 
        :key="status.value" 
        class="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-900 rounded-lg transition-all"
        :class="{ 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20': dragOverStatus === status.value }"
        @dragover.prevent="onDragOver($event, status.value)"
        @dragenter.prevent="onDragEnter(status.value)"
        @dragleave="onDragLeave($event, status.value)"
        @drop.prevent="onDrop(status.value)"
      >
        <div class="p-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: status.color }"></span>
              {{ status.label }}
            </h3>
            <span class="text-sm text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded">
              {{ getProjectsByStatus(status.value).length }}
            </span>
          </div>
        </div>
        <div class="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto min-h-[100px]">
          <div
            v-for="project in getProjectsByStatus(status.value)"
            :key="project.id"
            class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
            :class="{ 'opacity-50 scale-95': draggingProject?.id === project.id }"
            draggable="true"
            @dragstart="onDragStart($event, project)"
            @dragend="onDragEnd"
            @click="navigateTo(`/projects/${project.id}`)"
          >
            <div class="flex items-start justify-between mb-2">
              <span v-if="project.product" class="text-xs text-blue-600 dark:text-blue-400 font-medium">{{ project.product.name }}</span>
              <button @click.stop="openDateEditor(project)" class="text-gray-400 hover:text-blue-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <h4 class="font-medium text-sm mb-2">{{ project.name }}</h4>
            
            <!-- Timeline -->
            <div v-if="project.start_date || project.target_end_date" class="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span v-if="project.start_date">{{ formatDateShort(project.start_date) }}</span>
              <span v-if="project.start_date && project.target_end_date"> - </span>
              <span v-if="project.target_end_date">{{ formatDateShort(project.target_end_date) }}</span>
            </div>

            <!-- Progress bar -->
            <div v-if="project.total_tasks > 0" class="mb-2">
              <div class="flex items-center justify-between text-xs mb-0.5">
                <span class="text-gray-500">{{ project.completed_tasks }}/{{ project.total_tasks }}</span>
              </div>
              <div class="bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                <div class="bg-blue-600 h-1 rounded-full" :style="{ width: project.task_progress + '%' }"></div>
              </div>
            </div>

            <!-- Labels -->
            <div v-if="project.labels?.length > 0" class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="pl in project.labels.slice(0, 2)"
                :key="pl.id"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                :style="{ backgroundColor: pl.label?.color + '20', color: pl.label?.color }"
              >
                {{ pl.label?.name }}
              </span>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ project.owner?.full_name || 'Unassigned' }}</span>
            </div>
          </div>
          <div v-if="getProjectsByStatus(status.value).length === 0" class="text-center py-8 text-gray-400 text-sm">
            No projects
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProjectCreateModal :show="showCreateModal" :project="selectedProject" @close="closeModal" @saved="handleSaved" />
    
    <!-- Label Editor Modal -->
    <div v-if="labelEditorProject" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeLabelEditor">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Manage Labels - {{ labelEditorProject.name }}</h3>
          <button @click="closeLabelEditor" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ProjectLabels :project-id="labelEditorProject.id" @updated="loadProjects" />
      </div>
    </div>

    <!-- Date Editor Modal -->
    <div v-if="dateEditorProject" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeDateEditor">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Edit Timeline - {{ dateEditorProject.name }}</h3>
          <button @click="closeDateEditor" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" v-model="dateForm.start_date" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Target End Date</label>
              <input type="date" v-model="dateForm.target_end_date" class="input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Progress ({{ dateForm.progress_percentage }}%)</label>
            <input type="range" v-model="dateForm.progress_percentage" min="0" max="100" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Roadmap Color</label>
            <div class="flex gap-2">
              <button 
                v-for="color in colorOptions" 
                :key="color"
                @click="dateForm.roadmap_color = color"
                class="w-8 h-8 rounded-full border-2 transition-transform"
                :class="dateForm.roadmap_color === color ? 'scale-110 border-gray-800 dark:border-white' : 'border-transparent'"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeDateEditor" class="btn btn-secondary">Cancel</button>
          <button @click="saveDates" class="btn btn-primary" :disabled="savingDates">
            {{ savingDates ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { apiFetch } = useApi()
const route = useRoute()
const router = useRouter()
const { projectStatuses, loadProjectStatuses, getStatusColor, getStatusLabel } = useProjectStatuses()

// Data
const loading = ref(true)
const projects = ref<any[]>([])
const products = ref<any[]>([])
const users = ref<any[]>([])

// UI State
const showCreateModal = ref(false)
const selectedProject = ref(null)
const activeMenu = ref<string | null>(null)
const viewMode = ref('table') // 'table', 'grid', 'kanban'

// Filters & Sort
const searchQuery = ref('')
const sortBy = ref('priority_order')
const sortOrder = ref('asc')
const filters = ref({
  product_id: route.query.product_id as string || '',
  owner_id: '',
  status: ''
})

// Label Editor
const labelEditorProject = ref<any>(null)

// Date Editor
const dateEditorProject = ref<any>(null)
const savingDates = ref(false)
const dateForm = ref({
  start_date: '',
  target_end_date: '',
  progress_percentage: 0,
  roadmap_color: '#3B82F6'
})

// Drag and Drop (Kanban)
const draggingProject = ref<any>(null)
const dragOverStatus = ref<string | null>(null)

// Table Priority Drag and Drop
const dragOverIndex = ref<number | null>(null)
const draggingIndex = ref<number | null>(null)
const savingPriorities = ref(false)

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
]

// Kanban statuses - computed from dynamic project statuses
const kanbanStatuses = computed(() => {
  return projectStatuses.value.map(status => ({
    value: status.slug,
    label: status.name,
    color: status.color
  }))
})

// Computed
const canCreate = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const canEdit = computed(() => {
  const role = authStore.user?.role?.toLowerCase()
  return ['owner', 'admin', 'manager'].includes(role)
})

const filteredProjects = computed(() => {
  let result = projects.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((p: any) => 
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.product?.name?.toLowerCase().includes(query)
    )
  }

  if (filters.value.product_id) {
    result = result.filter((p: any) => p.product_id === filters.value.product_id)
  }

  if (filters.value.owner_id) {
    result = result.filter((p: any) => p.owner_id === filters.value.owner_id)
  }

  if (filters.value.status) {
    result = result.filter((p: any) => p.status === filters.value.status)
  }

  return result
})

// Helper to check if project is prioritized (has priority_order > 0)
const isPrioritized = (project: any) => {
  return project.priority_order !== null && 
         project.priority_order !== undefined && 
         project.priority_order > 0
}

// Helper to check if project is completed (done or cancelled)
const isCompleted = (project: any) => {
  return project.status === 'done' || project.status === 'cancelled'
}

// Active prioritized projects (priority_order > 0, not done/cancelled) - sorted by priority
const prioritizedProjects = computed(() => {
  return filteredProjects.value
    .filter(p => isPrioritized(p) && !isCompleted(p))
    .sort((a, b) => a.priority_order - b.priority_order)
})

// Unprioritized projects (priority_order = 0, null, or undefined, not done/cancelled)
const unprioritizedProjects = computed(() => {
  return filteredProjects.value
    .filter(p => !isPrioritized(p) && !isCompleted(p))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Completed projects (done or cancelled)
const completedProjects = computed(() => {
  return filteredProjects.value
    .filter(isCompleted)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const sortedProjects = computed(() => {
  const sorted = [...filteredProjects.value]
  
  // Priority sorting handled by prioritizedProjects/unprioritizedProjects for split view
  if (sortBy.value === 'priority_order') {
    // Return all for non-split views (grid, kanban)
    return [...prioritizedProjects.value, ...unprioritizedProjects.value]
  }
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    if (aVal === null || aVal === undefined) aVal = ''
    if (bVal === null || bVal === undefined) bVal = ''
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  return sorted
})

// Methods
const loadProjects = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/projects')
    projects.value = response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await apiFetch('/products')
    products.value = response.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await apiFetch('/users')
    users.value = response.data || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = { product_id: '', owner_id: '', status: '' }
}

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const editProject = (project: any) => {
  selectedProject.value = project
  showCreateModal.value = true
  activeMenu.value = null
}

const deleteProject = async (project: any) => {
  if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return
  
  try {
    await apiFetch(`/projects/${project.id}`, { method: 'DELETE' })
    await loadProjects()
  } catch (error) {
    console.error('Failed to delete project:', error)
    alert('Failed to delete project')
  }
  activeMenu.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  selectedProject.value = null
}

const handleSaved = (savedProject: any) => {
  // If this was a new project creation (not an edit), navigate to its details page
  if (!selectedProject.value && savedProject?.id) {
    router.push(`/projects/${savedProject.id}`)
  } else {
    loadProjects()
  }
}

// Label Editor
const openLabelEditor = (project: any) => {
  labelEditorProject.value = project
  activeMenu.value = null
}

const closeLabelEditor = () => {
  labelEditorProject.value = null
}

// Date Editor
const openDateEditor = (project: any) => {
  dateEditorProject.value = project
  dateForm.value = {
    start_date: project.start_date || '',
    target_end_date: project.target_end_date || '',
    progress_percentage: project.progress_percentage || 0,
    roadmap_color: project.roadmap_color || '#3B82F6'
  }
  activeMenu.value = null
}

const closeDateEditor = () => {
  dateEditorProject.value = null
}

const saveDates = async () => {
  if (!dateEditorProject.value) return
  
  savingDates.value = true
  try {
    await apiFetch(`/projects/${dateEditorProject.value.id}`, {
      method: 'PATCH',
      body: dateForm.value
    })
    await loadProjects()
    closeDateEditor()
  } catch (error) {
    console.error('Failed to save dates:', error)
    alert('Failed to save dates')
  } finally {
    savingDates.value = false
  }
}

// Kanban helpers
const getProjectsByStatus = (status: string) => {
  return filteredProjects.value.filter((p: any) => p.status === status)
}

// Drag and Drop handlers
const onDragStart = (event: DragEvent, project: any) => {
  draggingProject.value = project
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', project.id)
  }
}

const onDragEnd = () => {
  draggingProject.value = null
  dragOverStatus.value = null
}

const onDragOver = (event: DragEvent, status: string) => {
  if (draggingProject.value && draggingProject.value.status !== status) {
    event.dataTransfer!.dropEffect = 'move'
  }
}

const onDragEnter = (status: string) => {
  if (draggingProject.value && draggingProject.value.status !== status) {
    dragOverStatus.value = status
  }
}

const onDragLeave = (event: DragEvent, status: string) => {
  // Only clear if we're actually leaving the column (not just entering a child)
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!relatedTarget || !event.currentTarget || !(event.currentTarget as HTMLElement).contains(relatedTarget)) {
    if (dragOverStatus.value === status) {
      dragOverStatus.value = null
    }
  }
}

const onDrop = async (newStatus: string) => {
  if (!draggingProject.value || draggingProject.value.status === newStatus) {
    dragOverStatus.value = null
    return
  }

  const project = draggingProject.value
  const oldStatus = project.status
  
  // Optimistically update the UI
  project.status = newStatus
  
  try {
    await apiFetch(`/projects/${project.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
  } catch (error) {
    // Revert on failure
    project.status = oldStatus
    console.error('Failed to update project status:', error)
    alert('Failed to update project status')
  }
  
  draggingProject.value = null
  dragOverStatus.value = null
}

// Table Priority Drag and Drop handlers
const draggingProject2 = ref<any>(null)
const dragOverSection = ref<'prioritized' | 'unprioritized' | null>(null)

const onTableDragStart = (event: DragEvent, project: any) => {
  draggingProject2.value = project
  draggingIndex.value = prioritizedProjects.value.findIndex(p => p.id === project.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', project.id)
  }
}

const onTableDragEnd = () => {
  draggingProject2.value = null
  draggingIndex.value = null
  dragOverIndex.value = null
  dragOverSection.value = null
}

const onTableDragOver = (index: number) => {
  if (draggingProject2.value) {
    dragOverIndex.value = index
    dragOverSection.value = 'prioritized'
  }
}

const onTableDragLeave = () => {
  // Don't clear immediately - let dragover on another element set the new values
}

const onUnprioritizedDragOver = () => {
  if (draggingProject2.value) {
    dragOverSection.value = 'unprioritized'
    dragOverIndex.value = null
  }
}

// Handler for dropping on the prioritized header
const onPrioritizedHeaderDragOver = () => {
  if (draggingProject2.value) {
    dragOverSection.value = 'prioritized'
    // When there are no prioritized projects, drop at 0
    // When there are, this header becomes a "drop at top" zone
    dragOverIndex.value = 0
  }
}

const onPrioritizedHeaderDrop = () => {
  if (draggingProject2.value) {
    // Drop at position 0 (top of priority list)
    onTableDrop(0)
  }
}

const onTableDrop = async (targetIndex: number) => {
  if (!draggingProject2.value) {
    dragOverIndex.value = null
    dragOverSection.value = null
    return
  }

  const draggedProject = draggingProject2.value
  const wasUnprioritized = !isPrioritized(draggedProject) || isCompleted(draggedProject)
  
  // Get current prioritized list
  const currentPrioritized = [...prioritizedProjects.value]
  
  // Remove from current position if it was prioritized
  if (!wasUnprioritized) {
    const currentIdx = currentPrioritized.findIndex(p => p.id === draggedProject.id)
    if (currentIdx !== -1) {
      currentPrioritized.splice(currentIdx, 1)
    }
  }
  
  // Insert at target position
  currentPrioritized.splice(targetIndex, 0, draggedProject)
  
  // Update priority_order for all prioritized projects
  currentPrioritized.forEach((p: any, idx: number) => {
    p.priority_order = idx + 1
  })
  
  // If project was completed, change status back to ongoing
  if (isCompleted(draggedProject)) {
    draggedProject.status = 'ongoing'
  }
  
  draggingProject2.value = null
  draggingIndex.value = null
  dragOverIndex.value = null
  dragOverSection.value = null
  
  // Auto-save priorities
  await savePriorities()
}

const onUnprioritizedDrop = async () => {
  if (!draggingProject2.value) {
    dragOverSection.value = null
    return
  }

  const draggedProject = draggingProject2.value
  
  // Set priority_order to 0 to deprioritize
  draggedProject.priority_order = 0
  
  draggingProject2.value = null
  draggingIndex.value = null
  dragOverIndex.value = null
  dragOverSection.value = null
  
  // Auto-save priorities
  await savePriorities()
}

const savePriorities = async () => {
  savingPriorities.value = true
  try {
    // Get all non-completed projects with their current priority_order
    const allActiveProjects = projects.value.filter((p: any) => !isCompleted(p))
    const priorities = allActiveProjects.map((p: any) => ({
      id: p.id,
      priority_order: p.priority_order || 0
    }))
    
    await apiFetch('/projects/priorities', {
      method: 'POST',
      body: { priorities }
    })
    // Local state is already updated optimistically, no need to reload
  } catch (error) {
    console.error('Failed to save priorities:', error)
    alert('Failed to save priorities')
    // On error, reload to restore correct state
    await loadProjects()
  } finally {
    savingPriorities.value = false
  }
}

// Formatting
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getStatusClass = (slug: string) => {
  const statusObj = projectStatuses.value.find(s => s.slug === slug)
  if (!statusObj) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  
  // Generate class based on color - convert hex to Tailwind-like classes
  const color = statusObj.color || '#6B7280'
  return `bg-opacity-20 dark:bg-opacity-30`
}

const getStatusStyle = (slug: string) => {
  const color = getStatusColor(slug)
  return {
    backgroundColor: color + '20',
    color: color
  }
}

// Initialize
onMounted(async () => {
  await loadProjectStatuses()
  loadProjects()
  loadProducts()
  loadUsers()
  
  // Close menus on outside click
  document.addEventListener('click', (e: any) => {
    if (!e.target.closest('.relative')) {
      activeMenu.value = null
    }
  })
})
</script>
