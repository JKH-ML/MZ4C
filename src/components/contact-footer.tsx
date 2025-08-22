'use client'

import { Mail, MessageCircle } from 'lucide-react'

export function ContactFooter() {
  return (
    <footer className="mt-12 pt-8 border-t border-gray-200 bg-white/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <a
              href="https://open.kakao.com/me/maplestudy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              후원하기 (오픈톡)
            </a>
            <a
              href="mailto:banghak2da@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              title="banghak2da@gmail.com"
            >
              <Mail className="h-4 w-4" />
              문의하기
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-4 pb-4">
          © 2025 메짤네컷. MapleStory character images are property of Nexon.
        </div>
      </div>
    </footer>
  )
}