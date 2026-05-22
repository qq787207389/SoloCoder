<template>
  <div class="animate-fade-in max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="font-serif text-3xl font-bold text-gray-800 mb-2">创建新食谱</h1>
      <p class="text-gray-500">分享你的美食秘方</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <div class="bg-white rounded-2xl p-6 shadow-md">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Image class="w-5 h-5 mr-2 text-primary-500" />
          封面图片
        </h2>
        <div 
          class="relative border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
          :class="{ 'border-primary-400': form.coverImage }"
          @click="triggerImageUpload"
        >
          <div v-if="!form.coverImage" class="h-48 flex flex-col items-center justify-center text-gray-400">
            <Upload class="w-12 h-12 mb-2" />
            <p>点击上传封面图片</p>
          </div>
          <img 
            v-else 
            :src="form.coverImage" 
            alt="封面" 
            class="w-full h-64 object-cover"
          />
          <input 
            ref="imageInput" 
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="handleImageUpload"
          />
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-md">
        <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText class="w-5 h-5 mr-2 text-primary-500" />
          基本信息
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">食谱名称 *</label>
            <input
              v-model="form.title"
              type="text"
              class="input-field"
              placeholder="例如：红烧肉"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">简介 *</label>
            <textarea
              v-model="form.description"
              class="input-field resize-none"
              rows="3"
              placeholder="简单描述这道菜的特点..."
              required
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
              <select v-model="form.category" class="input-field" required>
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">难度 *</label>
              <select v-model="form.difficulty" class="input-field" required>
                <option value="">请选择难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">烹饪时间(分钟) *</label>
              <input
                v-model.number="form.cookTime"
                type="number"
                min="1"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">份量(人份) *</label>
              <input
                v-model.number="form.servings"
                type="number"
                min="1"
                class="input-field"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <ShoppingBag class="w-5 h-5 mr-2 text-primary-500" />
            食材清单
          </h2>
          <button 
            type="button"
            @click="addIngredient"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <Plus class="w-4 h-4 mr-1" />
            添加食材
          </button>
        </div>
        <div class="space-y-3">
          <div 
            v-for="(ing, index) in form.ingredients" 
            :key="ing.id"
            class="flex items-center gap-3"
          >
            <div class="flex-1">
              <input
                v-model="ing.name"
                type="text"
                class="input-field"
                placeholder="食材名称"
                list="ingredient-suggestions"
              />
              <datalist id="ingredient-suggestions">
                <option v-for="s in suggestions" :key="s" :value="s" />
              </datalist>
            </div>
            <div class="w-24">
              <input
                v-model="ing.quantity"
                type="text"
                class="input-field"
                placeholder="数量"
              />
            </div>
            <div class="w-20">
              <select v-model="ing.unit" class="input-field">
                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
            <button 
              type="button"
              @click="removeIngredient(index)"
              class="p-2 text-gray-400 hover:text-red-500 transition-colors"
              :disabled="form.ingredients.length <= 1"
            >
              <Minus class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 flex items-center">
            <ListOrdered class="w-5 h-5 mr-2 text-primary-500" />
            烹饪步骤
          </h2>
          <button 
            type="button"
            @click="addStep"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <Plus class="w-4 h-4 mr-1" />
            添加步骤
          </button>
        </div>
        <div class="space-y-6">
          <div 
            v-for="(step, index) in form.steps" 
            :key="step.id"
            class="relative"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                {{ index + 1 }}
              </div>
              <div class="flex-1 space-y-3">
                <textarea
                  v-model="step.description"
                  class="input-field resize-none"
                  rows="3"
                  placeholder="描述这一步的操作..."
                ></textarea>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-gray-400" />
                    <input
                      v-model.number="step.duration"
                      type="number"
                      min="1"
                      class="w-20 input-field text-sm py-2"
                      placeholder="分钟"
                    />
                    <span class="text-gray-500 text-sm">分钟</span>
                  </div>
                  <div class="relative">
                    <button 
                      type="button"
                      @click="triggerStepImageUpload(index)"
                      class="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <Image class="w-4 h-4 mr-1" />
                      {{ step.image ? '更换图片' : '添加图片' }}
                    </button>
                    <input 
                      :ref="el => setStepImageInput(el, index)"
                      type="file" 
                      accept="image/*" 
                      class="hidden" 
                      @change="(e) => handleStepImageUpload(e, index)"
                    />
                  </div>
                </div>
                <div v-if="step.image" class="relative">
                  <img :src="step.image" class="w-full max-w-xs rounded-xl" />
                  <button 
                    type="button"
                    @click="step.image = undefined"
                    class="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                type="button"
                @click="removeStep(index)"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                :disabled="form.steps.length <= 1"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 pb-8">
        <router-link to="/" class="btn-ghost flex-1 text-center">
          取消
        </router-link>
        <button 
          type="submit" 
          class="btn-primary flex-1"
          :disabled="loading"
        >
          <span v-if="loading">发布中...</span>
          <span v-else>发布食谱</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Image, FileText, ShoppingBag, ListOrdered, 
  Plus, Minus, Trash2, Upload, Clock, X 
} from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipe'
import { compressImage } from '@/utils/image'
import { categories, ingredientSuggestions } from '@/mocks/data'
import type { RecipeCategory, DifficultyLevel, Ingredient, CookingStep } from '@/types'

const router = useRouter()
const recipeStore = useRecipeStore()

const imageInput = ref<HTMLInputElement | null>(null)
const stepImageInputs = ref<(HTMLInputElement | null)[]>([])
const loading = ref(false)
const suggestions = ingredientSuggestions
const units = ['克', '个', '毫升', '勺', '片', '把', '适量']

const form = reactive({
  title: '',
  description: '',
  coverImage: '',
  category: '' as RecipeCategory | '',
  difficulty: '' as DifficultyLevel | '',
  cookTime: 30,
  servings: 2,
  ingredients: [
    { id: `ing-${Date.now()}-1`, name: '', quantity: '', unit: '克', checked: false } as Ingredient
  ],
  steps: [
    { id: `step-${Date.now()}-1`, order: 1, description: '', duration: 5 } as CookingStep
  ]
})

function triggerImageUpload() {
  imageInput.value?.click()
}

async function handleImageUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const compressed = await compressImage(file)
    form.coverImage = compressed
  } catch (error) {
    console.error('Image upload failed:', error)
  }
}

function setStepImageInput(el: any, index: number) {
  stepImageInputs.value[index] = el as HTMLInputElement
}

function triggerStepImageUpload(index: number) {
  stepImageInputs.value[index]?.click()
}

async function handleStepImageUpload(e: Event, index: number) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const compressed = await compressImage(file, 600, 400)
    form.steps[index].image = compressed
  } catch (error) {
    console.error('Image upload failed:', error)
  }
}

function addIngredient() {
  form.ingredients.push({
    id: `ing-${Date.now()}-${form.ingredients.length}`,
    name: '',
    quantity: '',
    unit: '克',
    checked: false
  } as Ingredient)
}

function removeIngredient(index: number) {
  if (form.ingredients.length > 1) {
    form.ingredients.splice(index, 1)
  }
}

function addStep() {
  form.steps.push({
    id: `step-${Date.now()}-${form.steps.length}`,
    order: form.steps.length + 1,
    description: '',
    duration: 5
  } as CookingStep)
}

function removeStep(index: number) {
  if (form.steps.length > 1) {
    form.steps.splice(index, 1)
    form.steps.forEach((step, i) => {
      step.order = i + 1
    })
  }
}

async function handleSubmit() {
  if (!form.title || !form.description || !form.category || !form.difficulty) {
    return
  }

  loading.value = true
  
  try {
    const recipeData = {
      ...form,
      category: form.category as RecipeCategory,
      difficulty: form.difficulty as DifficultyLevel
    }
    
    const result = await recipeStore.createRecipe(recipeData)
    if (result) {
      router.push('/')
    }
  } catch (error) {
    console.error('Create recipe failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  recipeStore.fetchCategories()
})
</script>
