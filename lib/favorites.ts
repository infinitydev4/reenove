// Utilitaires pour gérer les favoris

export const addToFavorites = async (artisanId: string) => {
  try {
    const response = await fetch('/api/client/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artisanId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de l\'ajout aux favoris')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error)
    throw error
  }
}

export const removeFromFavorites = async (artisanId?: string, favoriteId?: string) => {
  try {
    const params = new URLSearchParams()
    if (artisanId) params.append('artisanId', artisanId)
    if (favoriteId) params.append('favoriteId', favoriteId)

    const response = await fetch(`/api/client/favorites?${params.toString()}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suppression des favoris')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erreur lors de la suppression des favoris:', error)
    throw error
  }
}

export const checkIsFavorite = async (artisanId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/client/favorites')
    if (!response.ok) return false

    const data = await response.json()
    const favorites = data.favorites || []
    
    return favorites.some((favorite: any) => favorite.id === artisanId)
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error)
    return false
  }
}

export const getFavorites = async () => {
  try {
    const response = await fetch('/api/client/favorites')
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des favoris')
    }

    const data = await response.json()
    return data.favorites || []
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error)
    throw error
  }
} 