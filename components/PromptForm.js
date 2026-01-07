import { useState, useEffect } from 'react';
import { Sparkles, Wand2, Image as ImageIcon, Twitter, Search, X, Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from './Button';
import { Label, Textarea, Select, Input } from './Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

const STYLES = [
  { value: 'realistic', label: 'Realistic', icon: '📸' },
  { value: 'animated', label: 'Animated', icon: '🎨' },
  { value: 'artistic', label: 'Artistic', icon: '🖼️' },
  { value: 'minimal', label: 'Minimal', icon: '✨' },
  { value: 'vintage', label: 'Vintage', icon: '📻' },
];

export function PromptForm({ onSubmit, loading, userEmail }) {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [promptType, setPromptType] = useState('custom');
  const [showTweetSelector, setShowTweetSelector] = useState(false);
  const [tweets, setTweets] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [tweetSearchQuery, setTweetSearchQuery] = useState('');
  const [tweetPermissionGranted, setTweetPermissionGranted] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState(null);

  const handleRequestTweetPermission = async () => {
    if (!session?.accessToken) {
      alert('Please sign in with Twitter to fetch your tweets.');
      return;
    }
    setTweetPermissionGranted(true);
    await fetchUserTweets();
  };

  const fetchUserTweets = async () => {
    if (!session?.accessToken) {
      alert('Twitter access token not available. Please sign in again.');
      return;
    }

    setLoadingTweets(true);
    try {
      const response = await fetch('/api/getUserTweets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.tweets) {
        setTweets(data.tweets);
        setShowTweetSelector(true);
      } else {
        alert('Unable to fetch your tweets automatically.\n\nPlease paste your tweet manually in the text field below.');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      alert('Failed to fetch tweets. Please try again.');
    } finally {
      setLoadingTweets(false);
    }
  };

  const handleTweetSelect = (tweet) => {
    setSelectedTweet(tweet);
    setPrompt(tweet.text);
    setShowTweetSelector(false);
  };

  const filteredTweets = tweets.filter(tweet =>
    tweet.text.toLowerCase().includes(tweetSearchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit({ prompt, style, email: userEmail });
  };

  useEffect(() => {
    if (promptType === 'custom') {
      setSelectedTweet(null);
      setShowTweetSelector(false);
      setTweetPermissionGranted(false);
    }
  }, [promptType]);

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
              onChange={(e) => {
                setPromptType(e.target.value);
                if (e.target.value === 'custom') {
                  setPrompt('');
                }
              }}
              className="mt-2 bg-slate-800/50 border-slate-700 text-slate-100"
            >
              <option value="custom">Custom Design</option>
              <option value="tweet">From Tweet</option>
            </Select>
          </div>

          {promptType === 'tweet' && !tweetPermissionGranted && !showTweetSelector && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-start gap-3">
                <Twitter className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">Fetch Your Tweets</p>
                  <p className="text-xs text-slate-300 mb-3">
                    We can fetch your tweets from Twitter and display them in a searchable list. Or you can manually paste your tweet below.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleRequestTweetPermission}
                      disabled={loadingTweets}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loadingTweets ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Twitter className="mr-2 h-4 w-4" />
                          Fetch My Tweets
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-400 self-center">or paste your tweet manually below</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {promptType === 'tweet' && showTweetSelector && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300">Select a Tweet</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTweetSelector(false);
                    setTweetSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search tweets..."
                    value={tweetSearchQuery}
                    onChange={(e) => setTweetSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-700 rounded-lg p-2 bg-slate-900/30">
                {filteredTweets.length > 0 ? (
                  filteredTweets.map((tweet, idx) => (
                    <div
                      key={tweet.id || idx}
                      onClick={() => handleTweetSelect(tweet)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTweet?.id === tweet.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                    >
                      <p className="text-sm text-slate-200 line-clamp-3">{tweet.text}</p>
                      {tweet.created_at && (
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(tweet.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {tweetSearchQuery ? 'No tweets found matching your search' : 'No tweets available'}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="prompt" required className="text-slate-300">
              {promptType === 'tweet' ? 'Selected Tweet' : 'Design Prompt'}
            </Label>
            <Textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => {
                if (promptType !== 'tweet' || !selectedTweet) {
                  setPrompt(e.target.value);
                  if (promptType === 'tweet' && selectedTweet) {
                    setSelectedTweet(null);
                  }
                }
              }}
              readOnly={promptType === 'tweet' && selectedTweet !== null}
              placeholder={
                promptType === 'tweet'
                  ? selectedTweet ? "Selected tweet will appear here..." : "Select a tweet from above or paste your tweet here..."
                  : "e.g., 'A futuristic cityscape at sunset with flying cars' or describe your design idea..."
              }
              className={`mt-2 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 ${
                promptType === 'tweet' && selectedTweet ? 'cursor-not-allowed opacity-75' : ''
              }`}
            />
            {promptType === 'tweet' && selectedTweet && (
              <p className="mt-1 text-xs text-slate-400">
                This tweet is selected from your Twitter account. To change it, select a different tweet from the list above or clear and paste manually.
              </p>
            )}
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
