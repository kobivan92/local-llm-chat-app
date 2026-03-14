import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { FileAttachment } from './types'

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const base64ToBlob = (base64: string, type: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}

export const downloadFile = (attachment: FileAttachment) => {
  const blob = base64ToBlob(attachment.data, attachment.type)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = attachment.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type

  if (fileType.includes('image')) {
    return `[Image: ${file.name}]`
  }

  if (fileType.includes('pdf')) {
    return `[PDF Document: ${file.name}]`
  }

  if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
    try {
      const text = await file.text()
      const lines = text.split('\n').slice(0, 11)
      const preview = lines.slice(0, 10).join('\n')
      const totalLines = text.split('\n').length
      return `[CSV File: ${file.name}]\nTotal rows: ${totalLines}\nPreview (first 10 rows):\n${preview}`
    } catch (error) {
      return `[CSV File: ${file.name}]`
    }
  }

  if (fileType === 'application/json' || file.name.endsWith('.json')) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const preview = JSON.stringify(json, null, 2).slice(0, 500)
      return `[JSON File: ${file.name}]\nContent preview:\n${preview}${preview.length >= 500 ? '...' : ''}`
    } catch (error) {
      return `[JSON File: ${file.name}]`
    }
  }

  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      const rows = data.slice(0, 10) as unknown[][]
      const preview = rows.map(row => (row as string[]).join(' | ')).join('\n')
      return `[Excel Spreadsheet: ${file.name}]\nPreview (first 10 rows):\n${preview}`
    } catch (error) {
      return `[Excel Spreadsheet: ${file.name}]`
    }
  }

  if (fileType.includes('wordprocessing') || fileType.includes('msword')) {
    return `[Word Document: ${file.name}]`
  }

  return `[File: ${file.name}]`
}

export const exportConversationToPDF = (title: string, messages: Array<{ role: string; content: string; timestamp: number }>) => {
  const doc = new jsPDF()
  let yPosition = 20

  doc.setFontSize(18)
  doc.text(title, 20, yPosition)
  yPosition += 15

  doc.setFontSize(10)
  messages.forEach((message) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text(`${message.role === 'user' ? 'You' : 'Assistant'}:`, 20, yPosition)
    yPosition += 7

    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(message.content, 170)
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      doc.text(line, 20, yPosition)
      yPosition += 7
    })

    yPosition += 5
  })

  doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`)
}

export const exportConversationToExcel = (title: string, messages: Array<{ role: string; content: string; timestamp: number }>) => {
  const data = messages.map((message) => ({
    Role: message.role === 'user' ? 'You' : 'Assistant',
    Message: message.content,
    Time: new Date(message.timestamp).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Conversation')

  XLSX.writeFile(workbook, `${title.replace(/[^a-z0-9]/gi, '_')}.xlsx`)
}

export const exportConversationToCSV = (title: string, messages: Array<{ role: string; content: string; timestamp: number }>) => {
  const data = messages.map((message) => ({
    Role: message.role === 'user' ? 'You' : 'Assistant',
    Message: message.content,
    Time: new Date(message.timestamp).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportConversationToJSON = (title: string, messages: Array<{ role: string; content: string; timestamp: number }>) => {
  const data = {
    title,
    exportedAt: new Date().toISOString(),
    messages: messages.map((message) => ({
      role: message.role === 'user' ? 'You' : 'Assistant',
      message: message.content,
      timestamp: message.timestamp,
      time: new Date(message.timestamp).toLocaleString(),
    }))
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
