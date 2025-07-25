
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Heart, ChevronDown, Shuffle, Repeat, Mic2, Loader, Music, MoreVertical, PlusSquare, Download, ListMusic, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { QueueSheetContent } from './queue-sheet';
import { useRouter } from 'next/navigation';

function CreatePlaylistDialog({ children, onPlaylistCreated }: { children: React.ReactNode, onPlaylistCreated?: (playlist: any) => void }) {
    const { createPlaylist } = useMusicPlayer();
    const router = useRouter();
    const [playlistName, setPlaylistName] = useState('');

    const handleCreatePlaylist = () => {
        if (!playlistName.trim()) return;
        const newPlaylist = createPlaylist(playlistName);
        if (onPlaylistCreated) {
            onPlaylistCreated(newPlaylist);
        } else {
            router.push(`/playlist/${newPlaylist.id}`);
        }
        setPlaylistName(''); // Reset input after creation
    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Playlist</DialogTitle>
                    <DialogDescription>Give your playlist a name.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="playlist-name-dialog">Playlist Name</Label>
                    <Input 
                        id="playlist-name-dialog" 
                        placeholder="My Awesome Mix" 
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleCreatePlaylist} disabled={!playlistName.trim()}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MoreOptionsButton() {
    const { currentSong, playlists, addSongToPlaylist, toggleLyricsView, downloadSong } = useMusicPlayer();

    if (!currentSong) return null;
    
    const handlePlaylistCreated = (playlist: any) => {
        if (currentSong) {
            addSongToPlaylist(playlist.id, currentSong);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <PlusSquare className="mr-2 h-4 w-4" />
                        <span>Add to Playlist</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuLabel>Select Playlist</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             {playlists.map(playlist => (
                                <DropdownMenuItem key={playlist.id} onClick={() => addSongToPlaylist(playlist.id, currentSong)}>
                                    {playlist.name}
                                </DropdownMenuItem>
                             ))}
                             <DropdownMenuSeparator />
                             <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Playlist
                                </DropdownMenuItem>
                             </CreatePlaylistDialog>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={toggleLyricsView}>
                    <Mic2 className="mr-2 h-4 w-4" />
                    <span>View Lyrics</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => downloadSong(currentSong)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function QueueSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <ListMusic className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View Queue</p>
                    </TooltipContent>
                </Tooltip>
            </SheetTrigger>
            <SheetContent>
                <QueueSheetContent />
            </SheetContent>
        </Sheet>
    )
}

function ExpandedPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    progress, 
    duration, 
    handleProgressChange,
    skipForward, 
    skipBackward, 
    isFavorite, 
    toggleFavorite,
    isExpanded,
    toggleExpandPlayer,
    volume,
    isMuted,
    handleVolumeChange,
    handleMuteToggle,
    showLyrics,
    lyrics,
    loadingLyrics,
    toggleLyricsView,
    currentLineIndex,
    isShuffled,
    toggleShuffle,
  } = useMusicPlayer();
  
  const controls = useAnimation();
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeLyricRef = React.useRef<HTMLDivElement>(null);


  if (!currentSong) return null;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.y;
    const velocity = info.velocity.y;

    if (dragDistance > window.innerHeight / 4 || velocity > 500) {
      toggleExpandPlayer();
    } else {
      controls.start({ y: 0, transition: { type: 'spring', damping: 30, stiffness: 250 } });
    }
  };


  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const currentSongIsFavorite = isFavorite(currentSong.id);
  const lyricsLines = React.useMemo(() => lyrics?.split('\n').filter(line => line.trim() !== '') || [], [lyrics]);
    
  React.useEffect(() => {
    if (isExpanded) {
        controls.start({ y: 0 });
    } else {
        controls.start({ y: '100%' });
    }
  }, [isExpanded, controls]);

  React.useEffect(() => {
    if (showLyrics && activeLyricRef.current && lyricsContainerRef.current) {
        const container = lyricsContainerRef.current;
        const activeLine = activeLyricRef.current;
        const containerHeight = container.clientHeight;
        const activeLineTop = activeLine.offsetTop;
        const activeLineHeight = activeLine.clientHeight;

        container.scrollTo({
            top: activeLineTop - containerHeight / 2 + activeLineHeight / 2,
            behavior: 'smooth',
        });
    }
  }, [currentLineIndex, showLyrics]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const renderPlayerContent = () => {
    if (showLyrics) {
      return (
        <motion.div 
          className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
            {loadingLyrics ? (
            <Loader className="h-10 w-10 animate-spin text-primary" />
            ) : lyricsLines.length > 0 ? (
                <div 
                    ref={lyricsContainerRef}
                    className="w-full h-full overflow-y-auto p-8 scroll-smooth"
                >
                    <div className="flex flex-col gap-6 text-2xl font-bold">
                        {lyricsLines.map((line, index) => (
                        <div
                            key={index}
                            ref={currentLineIndex === index ? activeLyricRef : null}
                            className={cn(
                            "transition-all duration-300",
                            currentLineIndex === index
                                ? "text-foreground scale-105"
                                : "text-muted-foreground opacity-50"
                            )}
                        >
                            {line || '...'}
                        </div>
                        ))}
                    </div>
                </div>
            ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <Music className="h-8 w-8" />
                <p className="font-medium">No lyrics found</p>
                <p className="text-sm">Sorry, we couldn't find lyrics for this song.</p>
            </div>
            )}
        </motion.div>
      );
    }
    return (
        <motion.div 
            className="relative w-full h-full shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
        >
            <div className="absolute inset-0 animate-aurora-glow rounded-lg -z-10" />
            <Image
                src={currentSong.coverArt}
                alt={currentSong.title}
                fill
                className="object-cover rounded-lg"
            />
        </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-background z-[60] flex flex-col"
      initial={{ y: '100%' }}
      animate={controls}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
        <div 
            className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag from header
        >
            <Button variant="ghost" size="icon" onClick={toggleExpandPlayer}>
              <ChevronDown className="h-6 w-6" />
            </Button>
            <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Playing from Album</p>
                <p className="font-bold truncate">{currentSong.album}</p>
            </div>
             <MoreOptionsButton />
        </div>

        <motion.div 
            className="flex-1 flex flex-col justify-end items-center p-4 pt-20 pb-10"
            variants={containerVariants}
            initial="hidden"
            animate={isExpanded ? "visible" : "hidden"}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            <motion.div 
                className="relative w-full max-w-xs aspect-square mt-8" 
                variants={itemVariants}
                onDoubleClick={toggleLyricsView}
            >
              {renderPlayerContent()}
            </motion.div>

            <motion.div className="w-full max-w-sm space-y-4 mt-auto" variants={itemVariants}>
              <div className="flex justify-between items-center pt-8">
                <div className="flex-1 text-left overflow-hidden">
                  <h2 className="text-2xl font-bold truncate">{currentSong.title}</h2>
                  <p className="text-muted-foreground truncate">{currentSong.artist}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(currentSong.id)}>
                  <Heart className={cn("h-6 w-6", currentSongIsFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                </Button>
              </div>

              <div className="space-y-2 relative">
                  <Slider
                      value={[progress]}
                      max={duration}
                      step={1}
                      onValueChange={handleProgressChange}
                      className="w-full h-1 relative [&>span:first-child]:h-1 [&>span>span]:h-1 [&>span>span]:bg-accent [&>a]:h-3 [&>a]:w-3 [&>a]:bg-white"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                  </div>
              </div>

              <div className="flex items-center justify-around">
                   <Button variant="ghost" size="icon" onClick={toggleShuffle}>
                      <Shuffle className={cn("h-5 w-5", isShuffled ? "text-primary" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={skipBackward}>
                      <SkipBack className="h-6 w-6" />
                  </Button>
                  <Button size="icon" className="w-16 h-16 bg-primary hover:bg-primary/90 rounded-full shadow-lg" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="h-8 w-8 fill-primary-foreground" /> : <Play className="h-8 w-8 fill-primary-foreground ml-1" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={skipForward}>
                      <SkipForward className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {}}>
                      <Repeat className={cn("h-5 w-5 text-muted-foreground")} />
                  </Button>
              </div>
              
              <div className="flex items-center justify-between gap-4 pt-4">
                   <Button variant="ghost" size="icon" onClick={handleMuteToggle}>
                      {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-muted-foreground" /> : <Volume2 className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-full h-1 relative [&>span:first-child]:h-1 [&>span>span]:h-1 [&>span>span]:bg-white/40 [&>a]:h-3 [&>a]:w-3"
                  />
                   <Button variant="ghost" size="icon" onClick={toggleLyricsView} className={cn(showLyrics && "text-primary")}>
                      <Mic2 className="h-5 w-5" />
                  </Button>
              </div>
            </motion.div>
        </motion.div>
        
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="font-display text-muted-foreground text-lg">designed by ariyan</p>
        </div>
    </motion.div>
  )
}

export function MusicPlayer() {
  const {
    currentSong,
    nextSong,
    isPlaying,
    togglePlayPause,
    progress,
    duration,
    handleProgressChange,
    audioRef,
    volume,
    isMuted,
    handleVolumeChange,
    handleMuteToggle,
    skipForward,
    skipBackward,
    closePlayer,
    isFavorite,
    toggleFavorite,
    toggleExpandPlayer,
    showLyrics,
    toggleLyricsView,
    isShuffled,
    toggleShuffle,
  } = useMusicPlayer();
  
  const compactPlayerControls = useAnimation();

  const handleCompactPlayerDragEnd = (event: React.MouseEvent | React.TouchEvent | React.PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.y;
    const velocity = info.velocity.y;

    if (dragDistance > 60 || velocity > 500) {
      closePlayer();
      compactPlayerControls.start({ y: "100%", transition: { type: 'tween', ease: 'easeInOut', duration: 0.3 } });
    } else {
      compactPlayerControls.start({ y: 0, transition: { type: 'spring', damping: 30, stiffness: 250 } });
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (!currentSong) {
    return null;
  }
  
  const currentSongIsFavorite = isFavorite(currentSong.id);

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => e.stopPropagation();

  return (
    <>
      <ExpandedPlayer />

       <motion.div 
        animate={compactPlayerControls}
        drag="y"
        onDragEnd={handleCompactPlayerDragEnd}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        className="md:hidden fixed bottom-16 left-0 right-0 h-auto bg-background/90 backdrop-blur-md border-t z-50"
        style={{ touchAction: 'pan-y' }}
       >
         <div className="flex flex-col p-2 gap-2" onClick={toggleExpandPlayer}>
             <div className="flex items-center gap-3">
                <Image
                    src={currentSong.coverArt}
                    alt={currentSong.title}
                    width={40}
                    height={40}
                    className="rounded-md flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <p className="font-semibold truncate text-sm">{currentSong.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
                </div>
                <div className="flex items-center" onClick={stopPropagation}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={() => toggleFavorite(currentSong.id)}>
                        <Heart className={cn("h-5 w-5", currentSongIsFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0" onClick={togglePlayPause}>
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    {nextSong ? (
                       <Sheet>
                          <SheetTrigger asChild>
                             <Image
                                src={nextSong.coverArt}
                                alt={`Up next: ${nextSong.title}`}
                                width={28}
                                height={28}
                                className="rounded-sm flex-shrink-0 opacity-70 hover:opacity-100"
                            />
                          </SheetTrigger>
                          <SheetContent>
                            <QueueSheetContent />
                          </SheetContent>
                        </Sheet>
                    ) : (
                      <div className="w-7 h-7" /> // placeholder for spacing
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="text-[10px]">{formatTime(progress)}</span>
                <Slider
                    value={[progress]}
                    max={duration}
                    step={1}
                    onValueChange={(value) => handleProgressChange(value)}
                    onClick={stopPropagation}
                    onTouchStart={stopPropagation}
                    className="w-full h-1 relative [&>span:first-child]:h-1 [&>span>span]:h-1 [&>span>span]:bg-accent [&>a]:h-2.5 [&>a]:w-2.5"
                />
                <span className="text-[10px]">{formatTime(duration)}</span>
            </div>
        </div>
      </motion.div>


      <motion.div 
        className="hidden md:block fixed bottom-0 left-0 right-0 h-24 bg-background/80 backdrop-blur-md border-t z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.5)]"
        onClick={toggleExpandPlayer}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 w-1/4">
            <Image
              src={currentSong.coverArt}
              alt={currentSong.title}
              width={56}
              height={56}
              className="rounded-md"
            />
            <div>
              <p className="font-semibold truncate">{currentSong.title}</p>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
             <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSong.id); }}>
                <Heart className={cn("h-5 w-5", currentSongIsFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2 w-1/2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" onClick={toggleShuffle}>
                <Shuffle className={cn("h-5 w-5", isShuffled ? "text-primary" : "text-muted-foreground")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={skipBackward}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button size="icon" className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-6 w-6 fill-primary-foreground" /> : <Play className="h-6 w-6 fill-primary-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={skipForward}>
                <SkipForward className="h-5 w-5" />
              </Button>
               <Button variant="ghost" size="icon" onClick={() => {}}>
                <Repeat className={cn("h-5 w-5 text-muted-foreground")} />
              </Button>
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
              <Slider
                value={[progress]}
                max={duration}
                step={1}
                onValueChange={handleProgressChange}
                className="w-full h-1 relative [&>span:first-child]:h-1 [&>span>span]:h-1 [&>span>span]:bg-accent [&>a]:h-3 [&>a]:w-3 [&>a]:bg-white"
              />
              <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 w-1/4 justify-end" onClick={(e) => e.stopPropagation()}>
             <Button variant="ghost" size="icon" onClick={toggleLyricsView} className={cn(showLyrics && "text-primary")}>
                <Mic2 className="h-5 w-5" />
            </Button>
            <QueueSheet />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2 mb-2">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-full h-1 relative [&>span:first-child]:h-1 [&>span>span]:h-1 [&>span>span]:bg-white [&>a]:h-3 [&>a]:w-3"
                    />
                </PopoverContent>
            </Popover>
            <MoreOptionsButton />
             <Button variant="ghost" size="icon" onClick={closePlayer}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
