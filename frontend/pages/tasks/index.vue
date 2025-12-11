<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">Tasks</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage and track all your tasks</p>
      </div>
      <div class="flex gap-3">
        <!-- Column Visibility Dropdown -->
        <div class="relative" ref="columnMenuRef">
          <button 
            @click.stop="showColumnMenu = !showColumnMenu" 
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Columns
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Column Menu -->
          <div 
            v-if="showColumnMenu" 
            @click.stop
            class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-2"
          >
            <div class="text-sm font-medium px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 mb-2">
              Show Columns
            </div>
            <label 
              v-for="column in availableColumns" 
              :key="column.key"
              class="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <input 
                type="checkbox" 
                v-model="visibleColumns[column.key]"
                @change="saveColumnPreferences"
                class="mr-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ column.label }}</span>
            </label>
            <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <button 
                @click="resetColumns"
                class="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
        
        <button v-if="authStore.canCreateTasks" @click="showCreateModal = true" class="btn-primary">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>
    </div>

    <!-- Active Filter Banner -->
    <div v-if="statusFilter" class="mb-4 p-3 rounded-lg flex items-center justify-between" :class="statusFilterBannerClass">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="font-medium">Showing: {{ statusFilterLabel }}</span>
      </div>
      <button @click="clearFilters" class="text-sm underline hover:no-underline">Clear filter</button>
    </div>

    <!-- Filters, Sort, Group By -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
      <!-- Compact Filter Bar -->
      <div class="p-4">
        <div class="flex flex-wrap items-end gap-3">
          <!-- Search -->
          <div class="flex-1 min-w-[200px]">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search tasks..." 
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              @input="debouncedSearch"
            />
          </div>

          <!-- Status Filter -->
          <div class="w-[140px]">
            <select v-model="filters.status_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Statuses</option>
              <option v-for="status in statuses" :key="status.id" :value="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>

          <!-- Assignee Filter -->
          <div class="w-[140px]">
            <select v-model="filters.assignee_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Assignees</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.full_name || user.email }}
              </option>
            </select>
          </div>

          <!-- Project Filter -->
          <div class="w-[140px]">
            <select v-model="filters.project_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Projects</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Show More Toggle -->
          <button
            @click="showMoreFilters = !showMoreFilters"
            class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
          >
            <span>{{ showMoreFilters ? 'Show Less' : 'Show More' }}</span>
            <svg 
              class="w-4 h-4 transition-transform" 
              :class="{ 'rotate-180': showMoreFilters }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Clear Filters -->
          <button
            @click="clearFilters"
            class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Expanded Filters -->
      <div v-if="showMoreFilters" class="border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Product Filter -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Product</label>
            <select v-model="filters.product_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Products</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Priority</label>
            <select v-model="filters.priority" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All</option>
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
              <option value="3">Urgent</option>
            </select>
          </div>

          <!-- Agency Filter -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Agency</label>
            <select v-model="filters.agency_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Agencies</option>
              <option v-for="agency in agencies" :key="agency.id" :value="agency.id">
                {{ agency.name }}
              </option>
            </select>
          </div>

          <!-- Team Filter -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Team</label>
            <select v-model="filters.team_id" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">All Teams</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

          <!-- Labels Filter -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Labels</label>
            <div class="relative">
              <button
                @click="showLabelFilter = !showLabelFilter"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-left flex items-center justify-between"
              >
                <span v-if="selectedLabels.length === 0" class="text-gray-500">All Labels</span>
                <span v-else class="truncate">{{ selectedLabels.length }} selected</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="showLabelFilter" class="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <label
                  v-for="label in allLabels"
                  :key="label.id"
                  class="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="label.id"
                    v-model="selectedLabels"
                    class="mr-2"
                  />
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :style="{ backgroundColor: label.color + '20', color: label.color }"
                  >
                    {{ label.name }}
                  </span>
                </label>
                <div v-if="allLabels.length === 0" class="px-3 py-2 text-sm text-gray-500">No labels available</div>
              </div>
            </div>
          </div>

          <!-- Due Date From -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Due Date From</label>
            <input 
              v-model="filters.due_date_from" 
              type="date" 
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <!-- Due Date To -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Due Date To</label>
            <input 
              v-model="filters.due_date_to" 
              type="date" 
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <!-- Group By -->
          <div>
            <label class="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Group By</label>
            <select v-model="groupBy" class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
              <option value="">None</option>
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
              <option value="project">Project</option>
              <option value="product">Product</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

    </div>

    <!-- Tasks List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Grouped View -->
      <div v-else-if="groupBy && Object.keys(groupedTasks).length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="(group, groupKey) in groupedTasks" :key="groupKey" class="p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {{ getGroupLabel(groupKey) }} ({{ group.length }})
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th 
                    v-if="visibleColumns.task" 
                    @click="handleSort('title')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Task</span>
                      <span v-if="sortBy === 'title'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    v-if="visibleColumns.project" 
                    @click="handleSort('project_id')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Project</span>
                      <span v-if="sortBy === 'project_id'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    v-if="visibleColumns.status" 
                    @click="handleSort('status_id')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Status</span>
                      <span v-if="sortBy === 'status_id'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    v-if="visibleColumns.assignee" 
                    @click="handleSort('assignee_id')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Assignee</span>
                      <span v-if="sortBy === 'assignee_id'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th v-if="visibleColumns.teams_agencies" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teams/Agencies</th>
                  <th 
                    v-if="visibleColumns.due_date" 
                    @click="handleSort('due_date')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Due Date</span>
                      <span v-if="sortBy === 'due_date'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    v-if="visibleColumns.priority" 
                    @click="handleSort('priority')"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span>Priority</span>
                      <span v-if="sortBy === 'priority'" class="text-blue-600 dark:text-blue-400">
                        <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr 
                  v-for="task in group" 
                  :key="task.id" 
                  @click="router.push(`/tasks/${task.id}`)" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <td v-if="visibleColumns.task" class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: task.status?.color || '#6B7280' }"></div>
                      <div>
                        <p class="font-medium">{{ task.title }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.product?.name }}</p>
                      </div>
                    </div>
                  </td>
                  <td v-if="visibleColumns.project" class="px-6 py-4 text-sm">{{ task.project?.name }}</td>
                  <td v-if="visibleColumns.status" class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="{ backgroundColor: task.status?.color + '20', color: task.status?.color }">
                      {{ task.status?.name || 'No Status' }}
                    </span>
                  </td>
                  <td v-if="visibleColumns.assignee" class="px-6 py-4">
                    <div v-if="task.assignee" class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {{ getInitials(task.assignee.full_name || task.assignee.email) }}
                      </div>
                      <span class="text-sm">{{ task.assignee.full_name || task.assignee.email }}</span>
                    </div>
                    <span v-else class="text-sm text-gray-400">Unassigned</span>
                  </td>
                  <td v-if="visibleColumns.teams_agencies" class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="agency in task.agencies || []" 
                        :key="`agency-${agency.agency?.id}`"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ agency.agency?.name }}
                      </span>
                      <span 
                        v-for="team in task.teams || []" 
                        :key="`team-${team.team?.id}`"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      >
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h-5m-5 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v11a2 2 0 002 2zm0 0l-2 2m2-2l-2-2m0 0l-2-2m2 2l2 2m0 0l2 2m-2-2l2-2m0 0l2-2" />
                        </svg>
                        {{ team.team?.name }}
                      </span>
                      <span v-if="(!task.agencies || task.agencies.length === 0) && (!task.teams || task.teams.length === 0)" class="text-sm text-gray-400">None</span>
                    </div>
                  </td>
                  <td v-if="visibleColumns.due_date" class="px-6 py-4 text-sm">
                    <span v-if="task.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(task.due_date) }">
                      {{ formatDate(task.due_date) }}
                    </span>
                    <span v-else class="text-gray-400">No due date</span>
                  </td>
                  <td v-if="visibleColumns.priority" class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Ungrouped View -->
      <div v-else-if="filteredTasks.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th 
                v-if="visibleColumns.task" 
                @click="handleSort('title')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Task</span>
                  <span v-if="sortBy === 'title'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
              <th 
                v-if="visibleColumns.project" 
                @click="handleSort('project_id')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Project</span>
                  <span v-if="sortBy === 'project_id'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
              <th 
                v-if="visibleColumns.status" 
                @click="handleSort('status_id')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Status</span>
                  <span v-if="sortBy === 'status_id'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
              <th 
                v-if="visibleColumns.assignee" 
                @click="handleSort('assignee_id')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Assignee</span>
                  <span v-if="sortBy === 'assignee_id'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
              <th v-if="visibleColumns.teams_agencies" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teams/Agencies</th>
              <th 
                v-if="visibleColumns.due_date" 
                @click="handleSort('due_date')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Due Date</span>
                  <span v-if="sortBy === 'due_date'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
              <th 
                v-if="visibleColumns.priority" 
                @click="handleSort('priority')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
              >
                <div class="flex items-center gap-2">
                  <span>Priority</span>
                  <span v-if="sortBy === 'priority'" class="text-blue-600 dark:text-blue-400">
                    <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="task in filteredTasks" 
              :key="task.id" 
              @click="router.push(`/tasks/${task.id}`)" 
              class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <td v-if="visibleColumns.task" class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: task.status?.color || '#6B7280' }"></div>
                  <div>
                    <p class="font-medium">{{ task.title }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ task.product?.name }}</p>
                  </div>
                </div>
              </td>
              <td v-if="visibleColumns.project" class="px-6 py-4 text-sm">{{ task.project?.name }}</td>
              <td v-if="visibleColumns.status" class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :style="{ backgroundColor: task.status?.color + '20', color: task.status?.color }">
                  {{ task.status?.name || 'No Status' }}
                </span>
              </td>
              <td v-if="visibleColumns.assignee" class="px-6 py-4">
                <div v-if="task.assignee" class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {{ getInitials(task.assignee.full_name || task.assignee.email) }}
                  </div>
                  <span class="text-sm">{{ task.assignee.full_name || task.assignee.email }}</span>
                </div>
                <span v-else class="text-sm text-gray-400">Unassigned</span>
              </td>
              <td v-if="visibleColumns.teams_agencies" class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="agency in task.agencies || []" 
                    :key="`agency-${agency.agency?.id}`"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ agency.agency?.name }}
                  </span>
                  <span 
                    v-for="team in task.teams || []" 
                    :key="`team-${team.team?.id}`"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h-5m-5 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v11a2 2 0 002 2zm0 0l-2 2m2-2l-2-2m0 0l-2-2m2 2l2 2m0 0l2 2m-2-2l2-2m0 0l2-2" />
                    </svg>
                    {{ team.team?.name }}
                  </span>
                  <span v-if="(!task.agencies || task.agencies.length === 0) && (!task.teams || task.teams.length === 0)" class="text-sm text-gray-400">None</span>
                </div>
              </td>
              <td v-if="visibleColumns.due_date" class="px-6 py-4 text-sm">
                <span v-if="task.due_date" :class="{ 'text-red-600 dark:text-red-400': isOverdue(task.due_date) }">
                  {{ formatDate(task.due_date) }}
                </span>
                <span v-else class="text-gray-400">No due date</span>
              </td>
              <td v-if="visibleColumns.priority" class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getPriorityClass(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Tasks Found -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first task</p>
        <button v-if="authStore.canCreateTasks" @click="showCreateModal = true" class="btn-primary">
          Create Task
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="filteredTasks.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} tasks
        </p>
        <div class="flex gap-2">
          <button @click="previousPage" :disabled="pagination.page === 1" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Previous</button>
          <button @click="nextPage" :disabled="pagination.page >= pagination.totalPages" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>

    <TaskCreateModal :show="showCreateModal" :initial-project-id="filters.project_id" @close="showCreateModal = false" @created="handleTaskCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTasksStore } from '~/stores/tasks'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const loading = ref(true)
const showCreateModal = ref(false)
const showColumnMenu = ref(false)
const showMoreFilters = ref(false)
const columnMenuRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const groupBy = ref('')
const allLabels = ref<any[]>([])
const selectedLabels = ref<string[]>([])
const showLabelFilter = ref(false)

// Column visibility configuration
const availableColumns = [
  { key: 'task', label: 'Task' },
  { key: 'project', label: 'Project' },
  { key: 'status', label: 'Status' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'teams_agencies', label: 'Teams/Agencies' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'priority', label: 'Priority' }
]

// Default visible columns (all visible by default)
const defaultVisibleColumns = {
  task: true,
  project: true,
  status: true,
  assignee: true,
  teams_agencies: true,
  due_date: true,
  priority: true
}

const visibleColumns = ref({ ...defaultVisibleColumns })

// Special status filter from dashboard cards
const statusFilter = ref(route.query.status_filter as string || '')

const filters = ref({
  status_id: '',
  assignee_id: '',
  project_id: (route.query.project_id as string) || '',
  product_id: '',
  agency_id: '',
  team_id: '',
  priority: '',
  due_date_from: '',
  due_date_to: ''
})

const statuses = ref([])
const users = ref([])
const projects = ref([])
const products = ref([])
const agencies = ref([])
const teams = ref([])

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks

  // Client-side search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.project?.name?.toLowerCase().includes(query) ||
      task.product?.name?.toLowerCase().includes(query)
    )
  }

  // Apply special status filter from dashboard
  if (statusFilter.value) {
    const now = new Date()
    switch (statusFilter.value) {
      case 'in_progress':
        tasks = tasks.filter(task => task.status?.name === 'In Progress')
        break
      case 'completed':
        tasks = tasks.filter(task => task.status?.is_closed)
        break
      case 'overdue':
        tasks = tasks.filter(task => 
          task.due_date && 
          new Date(task.due_date) < now && 
          !task.status?.is_closed
        )
        break
    }
  }

  // Filter by labels
  if (selectedLabels.value.length > 0) {
    tasks = tasks.filter(task => {
      const taskLabelIds = (task.labels || []).map((tl: any) => tl.label?.id || tl.label_id)
      return selectedLabels.value.some(labelId => taskLabelIds.includes(labelId))
    })
  }

  return tasks
})

const groupedTasks = computed(() => {
  if (!groupBy.value) return []
  
  const groups: Record<string, any[]> = {}
  
  filteredTasks.value.forEach(task => {
    let key = 'Unassigned'
    
    if (groupBy.value === 'status') {
      key = task.status?.name || 'No Status'
    } else if (groupBy.value === 'assignee') {
      key = task.assignee ? (task.assignee.full_name || task.assignee.email) : 'Unassigned'
    } else if (groupBy.value === 'project') {
      key = task.project?.name || 'No Project'
    } else if (groupBy.value === 'product') {
      key = task.product?.name || 'No Product'
    } else if (groupBy.value === 'priority') {
      key = getPriorityLabel(task.priority)
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(task)
  })
  
  return groups
})

const pagination = computed(() => tasksStore.pagination)

const statusFilterLabel = computed(() => {
  switch (statusFilter.value) {
    case 'in_progress': return 'In Progress Tasks'
    case 'completed': return 'Completed Tasks'
    case 'overdue': return 'Overdue Tasks'
    default: return ''
  }
})

const statusFilterBannerClass = computed(() => {
  switch (statusFilter.value) {
    case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    case 'completed': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
    case 'overdue': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
  }
})

const getGroupLabel = (key: string) => {
  if (groupBy.value === 'status') return key
  if (groupBy.value === 'assignee') return key
  if (groupBy.value === 'project') return key
  if (groupBy.value === 'product') return key
  if (groupBy.value === 'priority') return `Priority: ${key}`
  return key
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getPriorityClass = (priority: number) => {
  const classes = [
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  ]
  return classes[priority] || classes[0]
}

const getPriorityLabel = (priority: number) => {
  const labels = ['Low', 'Medium', 'High', 'Urgent']
  return labels[priority] || 'Low'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const handleSort = (column: string) => {
  // If clicking the same column, toggle sort order
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Otherwise, set new column and default to ascending
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  loadTasks()
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  filters.value = {
    status_id: '',
    assignee_id: '',
    project_id: '',
    product_id: '',
    agency_id: '',
    team_id: '',
    priority: '',
    due_date_from: '',
    due_date_to: ''
  }
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
  groupBy.value = ''
  selectedLabels.value = []
  tasksStore.clearFilters()
  // Clear URL query params
  router.replace({ query: {} })
  loadTasks()
}

const loadTasks = async () => {
  loading.value = true
  try {
    const filterParams: any = {
      ...filters.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value
    }
    
    // Remove empty filters
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] === '' || filterParams[key] === null) {
        delete filterParams[key]
      }
    })
    
    await tasksStore.fetchTasks(filterParams)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
}

const loadStatuses = async () => {
  try {
    const response = await apiFetch('/statuses')
    statuses.value = response.data || []
  } catch (error) {
    console.error('Failed to load statuses:', error)
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

const loadProjects = async () => {
  try {
    const response = await apiFetch('/projects')
    projects.value = response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
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

const loadAgencies = async () => {
  try {
    const response = await apiFetch('/agencies')
    agencies.value = response.data || []
  } catch (error) {
    console.error('Failed to load agencies:', error)
  }
}

const loadTeams = async () => {
  try {
    const response = await apiFetch('/teams')
    teams.value = response.data || []
  } catch (error) {
    console.error('Failed to load teams:', error)
  }
}

const loadLabels = async () => {
  try {
    const response = await apiFetch('/labels')
    allLabels.value = response.data || []
  } catch (error) {
    console.error('Failed to load labels:', error)
  }
}

const debouncedSearch = debounce(() => {
  // Search is handled client-side in computed property
}, 300)

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const handleTaskCreated = () => {
  loadTasks()
}

const nextPage = () => {
  tasksStore.nextPage()
  loadTasks()
}

const previousPage = () => {
  tasksStore.previousPage()
  loadTasks()
}

watch([filters, sortBy, sortOrder], () => {
  tasksStore.setFilters(filters.value)
  loadTasks()
}, { deep: true })

// Watch for route query changes (e.g., when navigating from dashboard or projects)
watch(() => route.query.status_filter, (newValue) => {
  statusFilter.value = (newValue as string) || ''
})

watch(() => route.query.project_id, (newValue) => {
  filters.value.project_id = (newValue as string) || ''
})

const loadColumnPreferences = () => {
  if (process.client) {
    const saved = localStorage.getItem('tasks_column_preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        visibleColumns.value = { ...defaultVisibleColumns, ...parsed }
      } catch (e) {
        console.error('Failed to parse column preferences:', e)
      }
    }
  }
}

const saveColumnPreferences = () => {
  if (process.client) {
    localStorage.setItem('tasks_column_preferences', JSON.stringify(visibleColumns.value))
  }
}

const resetColumns = () => {
  visibleColumns.value = { ...defaultVisibleColumns }
  saveColumnPreferences()
}

// Handle click outside to close column menu
onMounted(() => {
  loadColumnPreferences()
  loadStatuses()
  loadUsers()
  loadProjects()
  loadProducts()
  loadAgencies()
  loadTeams()
  loadLabels()
  loadTasks()
  
  // Close column menu when clicking outside
  if (process.client) {
    document.addEventListener('click', (e) => {
      if (columnMenuRef.value && !columnMenuRef.value.contains(e.target as Node)) {
        showColumnMenu.value = false
      }
    })
  }
})

// Refresh tasks when navigating back from a task detail page
let previousPath = route.path
watch(() => route.path, (newPath) => {
  // If navigating from a task detail page back to the list, refresh
  if (newPath === '/tasks' && previousPath && previousPath.startsWith('/tasks/') && previousPath !== '/tasks') {
    loadTasks()
  }
  previousPath = newPath
})
</script>
