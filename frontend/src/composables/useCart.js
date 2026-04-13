import { ref, computed } from 'vue'

const CART_KEY = 'borrow_cart'

const items = ref(JSON.parse(localStorage.getItem(CART_KEY) || '[]'))

const saveToStorage = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(items.value))
}

export const useCart = () => {
  const cartCount = computed(() => items.value.length)

  const isInCart = (bookId) => items.value.some((i) => i.bookId === bookId)

  const addToCart = (book) => {
    if (isInCart(book._id)) return false
    items.value.push({
      bookId:     book._id,
      title:      book.title,
      author:     book.author,
      coverImage: book.coverImage,
    })
    saveToStorage()
    return true
  }

  const removeFromCart = (bookId) => {
    items.value = items.value.filter((i) => i.bookId !== bookId)
    saveToStorage()
  }

  const clearCart = () => {
    items.value = []
    saveToStorage()
  }

  return { items, cartCount, isInCart, addToCart, removeFromCart, clearCart }
}