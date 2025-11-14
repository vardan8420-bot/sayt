'use client'

import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import styles from './SEOOptimizer.module.css'

interface SEOMetrics {
  title: {
    value: string
    length: number
    score: number
    recommendations: string[]
  }
  description: {
    value: string
    length: number
    score: number
    recommendations: string[]
  }
  keywords: {
    value: string
    count: number
    score: number
    recommendations: string[]
  }
  overall: number
}

export function SEOOptimizer() {
  const { language } = useApp()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')

  const analyzeSEO = () => {
    setIsAnalyzing(true)
    
    // Симуляция анализа (в реальном приложении здесь будет вызов AI API)
    setTimeout(() => {
      const titleLength = title.length
      const descLength = description.length
      const keywordCount = keywords.split(',').filter(k => k.trim()).length
      
      const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : 
                        titleLength < 30 ? (titleLength / 30) * 100 : 
                        titleLength > 60 ? Math.max(0, 100 - ((titleLength - 60) * 5)) : 0
      
      const descScore = descLength >= 120 && descLength <= 160 ? 100 :
                       descLength < 120 ? (descLength / 120) * 100 :
                       descLength > 160 ? Math.max(0, 100 - ((descLength - 160) * 2)) : 0
      
      const keywordScore = keywordCount >= 3 && keywordCount <= 10 ? 100 :
                          keywordCount < 3 ? (keywordCount / 3) * 100 :
                          Math.max(0, 100 - ((keywordCount - 10) * 10))
      
      const overall = Math.round((titleScore + descScore + keywordScore) / 3)
      
      const titleRecs: string[] = []
      if (titleLength < 30) titleRecs.push(language === 'ru' ? 'Заголовок слишком короткий (минимум 30 символов)' : language === 'en' ? 'Title too short (minimum 30 characters)' : 'Sarlavha juda qisqa (kamida 30 belgi)')
      if (titleLength > 60) titleRecs.push(language === 'ru' ? 'Заголовок слишком длинный (максимум 60 символов)' : language === 'en' ? 'Title too long (maximum 60 characters)' : 'Sarlavha juda uzun (maksimum 60 belgi)')
      if (!title.includes(keywords.split(',')[0]?.trim())) titleRecs.push(language === 'ru' ? 'Добавьте основное ключевое слово в заголовок' : language === 'en' ? 'Add main keyword to title' : 'Asosiy kalit so\'zni sarlavhaga qo\'shing')
      
      const descRecs: string[] = []
      if (descLength < 120) descRecs.push(language === 'ru' ? 'Описание слишком короткое (минимум 120 символов)' : language === 'en' ? 'Description too short (minimum 120 characters)' : 'Tavsif juda qisqa (kamida 120 belgi)')
      if (descLength > 160) descRecs.push(language === 'ru' ? 'Описание слишком длинное (максимум 160 символов)' : language === 'en' ? 'Description too long (maximum 160 characters)' : 'Tavsif juda uzun (maksimum 160 belgi)')
      if (!description.includes(keywords.split(',')[0]?.trim())) descRecs.push(language === 'ru' ? 'Добавьте ключевые слова в описание' : language === 'en' ? 'Add keywords to description' : 'Kalit so\'zlarni tavsifga qo\'shing')
      
      const keywordRecs: string[] = []
      if (keywordCount < 3) keywordRecs.push(language === 'ru' ? 'Добавьте больше ключевых слов (минимум 3)' : language === 'en' ? 'Add more keywords (minimum 3)' : 'Ko\'proq kalit so\'z qo\'shing (kamida 3)')
      if (keywordCount > 10) keywordRecs.push(language === 'ru' ? 'Слишком много ключевых слов (максимум 10)' : language === 'en' ? 'Too many keywords (maximum 10)' : 'Juda ko\'p kalit so\'z (maksimum 10)')
      
      setMetrics({
        title: {
          value: title,
          length: titleLength,
          score: Math.round(titleScore),
          recommendations: titleRecs
        },
        description: {
          value: description,
          length: descLength,
          score: Math.round(descScore),
          recommendations: descRecs
        },
        keywords: {
          value: keywords,
          count: keywordCount,
          score: Math.round(keywordScore),
          recommendations: keywordRecs
        },
        overall
      })
      
      setIsAnalyzing(false)
    }, 1500)
  }

  const generateWithAI = async () => {
    setIsGenerating(true)
    
    // Симуляция AI генерации (в реальном приложении здесь будет вызов OpenAI API)
    setTimeout(() => {
      const suggestions = language === 'ru' 
        ? `AI-рекомендации для оптимизации:\n\n` +
          `1. Заголовок: "${title || 'Ваш заголовок'}" - ${title.length < 30 ? 'увеличьте до 30-60 символов' : 'оптимальная длина'}\n` +
          `2. Описание: "${description || 'Ваше описание'}" - ${description.length < 120 ? 'расширьте до 120-160 символов' : 'хорошая длина'}\n` +
          `3. Ключевые слова: используйте "${keywords || 'ваши ключевые слова'}" в начале заголовка и описания\n` +
          `4. Контент: добавьте больше релевантного контента (минимум 300 слов)\n` +
          `5. Структура: используйте H1, H2, H3 заголовки для лучшей структуры`
        : language === 'en'
        ? `AI optimization recommendations:\n\n` +
          `1. Title: "${title || 'Your title'}" - ${title.length < 30 ? 'increase to 30-60 characters' : 'optimal length'}\n` +
          `2. Description: "${description || 'Your description'}" - ${description.length < 120 ? 'expand to 120-160 characters' : 'good length'}\n` +
          `3. Keywords: use "${keywords || 'your keywords'}" at the beginning of title and description\n` +
          `4. Content: add more relevant content (minimum 300 words)\n` +
          `5. Structure: use H1, H2, H3 headings for better structure`
        : `AI optimallashtirish tavsiyalari:\n\n` +
          `1. Sarlavha: "${title || 'Sizning sarlavhangiz'}" - ${title.length < 30 ? '30-60 belgigacha oshiring' : 'optimal uzunlik'}\n` +
          `2. Tavsif: "${description || 'Sizning tavsifingiz'}" - ${description.length < 120 ? '120-160 belgigacha kengaytiring' : 'yaxshi uzunlik'}\n` +
          `3. Kalit so'zlar: "${keywords || 'kalit so\'zlaringiz'}" ni sarlavha va tavsifning boshida ishlating\n` +
          `4. Kontent: ko'proq muhim kontent qo'shing (kamida 300 so'z)\n` +
          `5. Struktura: yaxshi struktura uchun H1, H2, H3 sarlavhalardan foydalaning`
      
      setAiSuggestion(suggestions)
      setIsGenerating(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 50) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return language === 'ru' ? 'Отлично' : language === 'en' ? 'Excellent' : 'A\'lo'
    if (score >= 50) return language === 'ru' ? 'Хорошо' : language === 'en' ? 'Good' : 'Yaxshi'
    return language === 'ru' ? 'Требует улучшения' : language === 'en' ? 'Needs improvement' : 'Yaxshilash kerak'
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {language === 'ru' ? 'SEO Оптимизатор с AI' : language === 'en' ? 'SEO Optimizer with AI' : 'AI bilan SEO Optimizator'}
      </h3>
      <p className={styles.description}>
        {language === 'ru'
          ? 'Проанализируйте и оптимизируйте ваш контент для поисковых систем с помощью AI'
          : language === 'en'
          ? 'Analyze and optimize your content for search engines with AI'
          : 'AI yordamida kontentingizni qidiruv tizimlari uchun tahlil qiling va optimallashtiring'}
      </p>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {language === 'ru' ? 'Заголовок (Title)' : language === 'en' ? 'Title' : 'Sarlavha'}
            <span className={styles.hint}>
              {language === 'ru' ? '30-60 символов' : language === 'en' ? '30-60 characters' : '30-60 belgi'}
            </span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={language === 'ru' ? 'Введите заголовок страницы' : language === 'en' ? 'Enter page title' : 'Sahifa sarlavhasini kiriting'}
          />
          <div className={styles.charCount}>{title.length}/60</div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {language === 'ru' ? 'Описание (Meta Description)' : language === 'en' ? 'Meta Description' : 'Meta Tavsif'}
            <span className={styles.hint}>
              {language === 'ru' ? '120-160 символов' : language === 'en' ? '120-160 characters' : '120-160 belgi'}
            </span>
          </label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={language === 'ru' ? 'Введите описание страницы' : language === 'en' ? 'Enter page description' : 'Sahifa tavsifini kiriting'}
            rows={3}
          />
          <div className={styles.charCount}>{description.length}/160</div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {language === 'ru' ? 'Ключевые слова' : language === 'en' ? 'Keywords' : 'Kalit so\'zlar'}
            <span className={styles.hint}>
              {language === 'ru' ? 'Через запятую' : language === 'en' ? 'Comma separated' : 'Vergul bilan ajratilgan'}
            </span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={language === 'ru' ? 'ключевое слово 1, ключевое слово 2' : language === 'en' ? 'keyword 1, keyword 2' : 'kalit so\'z 1, kalit so\'z 2'}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            {language === 'ru' ? 'Контент' : language === 'en' ? 'Content' : 'Kontent'}
          </label>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={language === 'ru' ? 'Введите основной контент страницы' : language === 'en' ? 'Enter main page content' : 'Sahifaning asosiy kontentini kiriting'}
            rows={5}
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.analyzeButton}
            onClick={analyzeSEO}
            disabled={isAnalyzing}
          >
            {isAnalyzing
              ? language === 'ru' ? 'Анализ...' : language === 'en' ? 'Analyzing...' : 'Tahlil qilinmoqda...'
              : language === 'ru' ? '🔍 Анализировать SEO' : language === 'en' ? '🔍 Analyze SEO' : '🔍 SEO ni tahlil qilish'}
          </button>
          <button
            className={styles.aiButton}
            onClick={generateWithAI}
            disabled={isGenerating}
          >
            {isGenerating
              ? language === 'ru' ? 'Генерация...' : language === 'en' ? 'Generating...' : 'Yaratilmoqda...'
              : language === 'ru' ? '🤖 AI Рекомендации' : language === 'en' ? '🤖 AI Recommendations' : '🤖 AI Tavsiyalari'}
          </button>
        </div>
      </div>

      {metrics && (
        <div className={styles.results}>
          <div className={styles.overallScore}>
            <h4 className={styles.scoreTitle}>
              {language === 'ru' ? 'Общий SEO Score' : language === 'en' ? 'Overall SEO Score' : 'Umumiy SEO Ball'}
            </h4>
            <div
              className={styles.scoreCircle}
              style={{ '--score-color': getScoreColor(metrics.overall) } as React.CSSProperties}
            >
              <span className={styles.scoreValue}>{metrics.overall}</span>
            </div>
            <p className={styles.scoreLabel}>{getScoreLabel(metrics.overall)}</p>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span className={styles.metricName}>
                  {language === 'ru' ? 'Заголовок' : language === 'en' ? 'Title' : 'Sarlavha'}
                </span>
                <span
                  className={styles.metricScore}
                  style={{ color: getScoreColor(metrics.title.score) }}
                >
                  {metrics.title.score}%
                </span>
              </div>
              <div className={styles.metricBar}>
                <div
                  className={styles.metricBarFill}
                  style={{
                    width: `${metrics.title.score}%`,
                    backgroundColor: getScoreColor(metrics.title.score),
                  }}
                />
              </div>
              <div className={styles.metricInfo}>
                <span>
                  {language === 'ru' ? 'Длина:' : language === 'en' ? 'Length:' : 'Uzunlik:'} {metrics.title.length}
                </span>
              </div>
              {metrics.title.recommendations.length > 0 && (
                <ul className={styles.recommendations}>
                  {metrics.title.recommendations.map((rec, i) => (
                    <li key={i}>💡 {rec}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span className={styles.metricName}>
                  {language === 'ru' ? 'Описание' : language === 'en' ? 'Description' : 'Tavsif'}
                </span>
                <span
                  className={styles.metricScore}
                  style={{ color: getScoreColor(metrics.description.score) }}
                >
                  {metrics.description.score}%
                </span>
              </div>
              <div className={styles.metricBar}>
                <div
                  className={styles.metricBarFill}
                  style={{
                    width: `${metrics.description.score}%`,
                    backgroundColor: getScoreColor(metrics.description.score),
                  }}
                />
              </div>
              <div className={styles.metricInfo}>
                <span>
                  {language === 'ru' ? 'Длина:' : language === 'en' ? 'Length:' : 'Uzunlik:'} {metrics.description.length}
                </span>
              </div>
              {metrics.description.recommendations.length > 0 && (
                <ul className={styles.recommendations}>
                  {metrics.description.recommendations.map((rec, i) => (
                    <li key={i}>💡 {rec}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span className={styles.metricName}>
                  {language === 'ru' ? 'Ключевые слова' : language === 'en' ? 'Keywords' : 'Kalit so\'zlar'}
                </span>
                <span
                  className={styles.metricScore}
                  style={{ color: getScoreColor(metrics.keywords.score) }}
                >
                  {metrics.keywords.score}%
                </span>
              </div>
              <div className={styles.metricBar}>
                <div
                  className={styles.metricBarFill}
                  style={{
                    width: `${metrics.keywords.score}%`,
                    backgroundColor: getScoreColor(metrics.keywords.score),
                  }}
                />
              </div>
              <div className={styles.metricInfo}>
                <span>
                  {language === 'ru' ? 'Количество:' : language === 'en' ? 'Count:' : 'Soni:'} {metrics.keywords.count}
                </span>
              </div>
              {metrics.keywords.recommendations.length > 0 && (
                <ul className={styles.recommendations}>
                  {metrics.keywords.recommendations.map((rec, i) => (
                    <li key={i}>💡 {rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {aiSuggestion && (
        <div className={styles.aiSuggestion}>
          <h4 className={styles.aiTitle}>
            {language === 'ru' ? '🤖 AI Рекомендации' : language === 'en' ? '🤖 AI Recommendations' : '🤖 AI Tavsiyalari'}
          </h4>
          <pre className={styles.aiContent}>{aiSuggestion}</pre>
        </div>
      )}
    </div>
  )
}

