'use client'

import { lazy, Suspense } from 'react'
import { AppProvider, useApp } from '../context/AppContext'

const FileUploader = lazy(() => import('../components/FileUploader').then(m => ({ default: m.FileUploader })))
const ImageEditor = lazy(() => import('../components/ImageEditor').then(m => ({ default: m.ImageEditor })))

function Loading() {
	const { translations, language } = useApp()
	return <div style={{ padding: 24, textAlign: 'center' }}>{translations.loading[language]}</div>
}

function ToolsContent() {
	const { translations, language } = useApp()
	return (
		<div style={{ padding: 24, display: 'grid', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>{translations.toolsTitle[language]}</h1>
			<Suspense fallback={<Loading />}>
				<FileUploader />
			</Suspense>
			<Suspense fallback={<Loading />}>
				<ImageEditor />
			</Suspense>
		</div>
	)
}

export default function ToolsPage() {
	return (
		<AppProvider>
			<ToolsContent />
		</AppProvider>
	)
}


