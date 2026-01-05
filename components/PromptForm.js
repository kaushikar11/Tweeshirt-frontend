import { useState } from 'react';
import { Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { Label, Textarea, Select } from './Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

const STYLES = [
  { value: 'realistic', label: 'Realistic', icon: '📸' },
  { value: 'animated', label: 'Animated', icon: '🎨' },
  { value: 'artistic', label: 'Artistic', icon: '🖼️' },
  { value: 'minimal', label: 'Minimal', icon: '✨' },
  { value: 'vintage', label: 'Vintage', icon: '📻' },
];

export function PromptForm({ onSubmit, loading, userEmail }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [promptType, setPromptType] = useState('custom');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ prompt, style, email: userEmail });
  };

  return (
    <Card className="bg-glass-dark border-violet-500/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-primary p-2">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">Create Your Design</CardTitle>
            <CardDescription className="text-slate-400">
              Describe your vision or paste your tweet
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="promptType" className="text-slate-300">What are you creating?</Label>
            <Select
              id="promptType"
              value={promptType}
              onChange={(e) => setPromptType(e.target.value)}
              className="mt-2 bg-slate-800/50 border-slate-700 text-slate-100"
            >
              <option value="custom">Custom Design</option>
              <option value="tweet">From Tweet</option>
              <option value="quote">Quote or Text</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt" required className="text-slate-300">
              {promptType === 'tweet' ? 'Paste your tweet' : 'Design Prompt'}
            </Label>
            <Textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                promptType === 'tweet'
                  ? "Paste your tweet here..."
                  : promptType === 'quote'
                  ? "Enter your quote or text..."
                  : "e.g., 'A futuristic cityscape at sunset with flying cars' or describe your design idea..."
              }
              className="mt-2 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label htmlFor="style" className="text-slate-300">Style</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={`rounded-lg border-2 p-3 text-center transition-all ${
                    style === s.value
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xs text-slate-300">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!prompt.trim() || loading}
            size="lg"
            className="w-full"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Design
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
