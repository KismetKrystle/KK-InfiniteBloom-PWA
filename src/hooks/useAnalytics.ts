import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

type EventType = 'page_view' | 'access_code_use' | 'product_click' | 'share'

export function useAnalytics() {
  const trackEvent = async (eventType: EventType, data: any = {}) => {
    try {
      await Promise.resolve(supabase.from('analytics').insert({
        event_type: eventType,
        data,
        created_at: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page, timestamp: Date.now() })
  }

  const trackProductClick = (productName: string, productLink: string) => {
    trackEvent('product_click', { productName, productLink, timestamp: Date.now() })
  }

  const trackShare = (platform: string, content: string) => {
    trackEvent('share', { platform, content, timestamp: Date.now() })
  }

  const trackAccessCodeUse = (code: string, email: string) => {
    trackEvent('access_code_use', { code, email, timestamp: Date.now() })
  }

  // Auto-track page views
  useEffect(() => {
    const currentPath = window.location.pathname
    trackPageView(currentPath)
  }, [])

  return {
    trackEvent,
    trackPageView,
    trackProductClick,
    trackShare,
    trackAccessCodeUse
  }
}