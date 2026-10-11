
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Copy, Share2, Check } from 'lucide-react'

export function QRShare({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(()=> setCopied(false), 2000)
  }
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: 'My LinkNest', url }); return } catch {}
    }
    copy()
  }
  return (
    <div className="rounded-[20px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col items-center gap-4">
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG value={url} size={160} />
      </div>
      <p className="text-xs text-zinc-500 break-all text-center max-w-[260px]">{url}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={copy}>{copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />} {copied ? 'Copied' : 'Copy'}</Button>
        <Button size="sm" onClick={share}><Share2 className="h-4 w-4 mr-1" /> Share</Button>
      </div>
    </div>
  )
}
