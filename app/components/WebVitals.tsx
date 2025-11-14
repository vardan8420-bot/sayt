'use client'

import React, { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Отправка метрик в аналитику
    switch (metric.name) {
      case 'CLS':
        console.log('CLS:', metric.value)
        // Отправить в Google Analytics, или другую аналитику
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', metric.name, {
            value: Math.round(metric.value * 1000),
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
          })
        }
        break
      case 'FCP':
        console.log('FCP:', metric.value)
        break
      case 'FID':
        console.log('FID:', metric.value)
        break
      case 'INP':
        console.log('INP:', metric.value)
        break
      case 'LCP':
        console.log('LCP:', metric.value)
        break
      case 'TTFB':
        console.log('TTFB:', metric.value)
        break
      default:
        break
    }

    // Можно отправить на свой сервер
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
        keepalive: true,
      }).catch(console.error)
    }
  })

  return null
}

// Компонент для отображения метрик в режиме разработки
export function WebVitalsDisplay() {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({})

  useReportWebVitals((metric) => {
    setMetrics((prev) => ({
      ...prev,
      [metric.name]: metric.value,
    }))
  })

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Web Vitals</div>
      {Object.entries(metrics).map(([name, value]) => (
        <div key={name} style={{ marginBottom: '4px' }}>
          {name}: {value.toFixed(2)}
          {name === 'CLS' ? '' : 'ms'}
        </div>
      ))}
    </div>
  )
}

