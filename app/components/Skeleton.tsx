'use client'

import React from 'react'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : '20px'),
    borderRadius:
      borderRadius ||
      (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px'),
  }

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={style}
      aria-busy="true"
      aria-label="Loading..."
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.skeletonText}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="16px"
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton height="200px" borderRadius="8px" />
      <div className={styles.skeletonCardContent}>
        <Skeleton height="24px" width="60%" />
        <SkeletonText lines={2} />
        <Skeleton height="32px" width="40%" />
      </div>
    </div>
  )
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className={styles.skeletonListItem}>
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className={styles.skeletonListItemContent}>
            <Skeleton height="16px" width="70%" />
            <Skeleton height="14px" width="50%" />
          </div>
        </div>
      ))}
    </div>
  )
}

