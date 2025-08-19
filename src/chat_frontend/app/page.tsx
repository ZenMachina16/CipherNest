import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <main className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">CipherNest</h1>
        <p className="text-xl text-muted-foreground">
          Post-quantum secure messaging with ephemeral encryption
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Test Message Input
          </label>
          <Input 
            id="message"
            placeholder="Type your secure message..." 
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="default">Send Message</Button>
          <Button variant="outline">Connect Wallet</Button>
          <Button variant="secondary">Settings</Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="destructive" size="sm">Delete</Button>
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button variant="link" size="sm">Learn More</Button>
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 End-to-end encrypted • 🚀 Quantum-resistant • ⏱️ Auto-delete in 24h</p>
      </div>
    </main>
  )
}
