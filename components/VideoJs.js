import React, { PureComponent, useState, useMemo, useRef, useEffect } from 'react'

import videojs from 'video.js'

import 'videojs-contrib-quality-levels'

import 'videojs-vtt-thumbnails'

import 'videojs-youtube/dist/Youtube.min.js'

import 'videojs-contrib-eme/dist/videojs-contrib-eme'

export default class extends PureComponent {
    render () {
        return <VideoPlayer {...this.props}></VideoPlayer>
    }
}

function VideoPlayer ({ onPlayerReady }) {
    const playerRef = useRef()

    const [, setPlayer] = useState()

    const playerProps = useMemo(()=> {
        return {
            autoplay: true,
            controls: true,
            youtube: { ytControls: 1 }
        }
    }, [])

    useEffect(()=> {
        if (playerRef.current) {
            const player = videojs(playerRef.current, playerProps || {}, function () {
                setPlayer(player)
                onPlayerReady(false, player)
            })

            player.qualityLevels()
            player.eme()

            return function () { 
                player.dispose() 
            }
        }
    }, [onPlayerReady, playerRef, playerProps]) //eslint-disable-line

    return <div style={{
        maxWidth: '140vh',
        margin: '0 auto'
    }}>
        <style>{`
        .vjs-vtt-thumbnail-display {
            position: absolute;
            bottom: 3em;
            pointer-events: none;
            user-select: none;
        }
        `}</style>
        <div data-vjs-player>
            <video data-vjs-fluid ref={playerRef} className="video-js"></video>
        </div>
    </div>
}
