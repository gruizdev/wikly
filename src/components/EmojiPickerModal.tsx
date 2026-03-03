import { useRef, useEffect } from 'react'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

interface EmojiPickerModalProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
}

export const EmojiPickerModal = ({ onSelectEmoji, onClose }: EmojiPickerModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelectEmoji(emojiData.emoji)
    onClose()
  }

  return (
    <div ref={modalRef} className="absolute top-full left-0 mt-3 z-50 bg-white rounded-xl shadow-2xl overflow-hidden">
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        autoFocusSearch
        theme={'light' as Theme}
        width={300}
        height={400}
      />
    </div>
  )
}
