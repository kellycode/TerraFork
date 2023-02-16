// LICENSE: MIT
// Copyright (c) 2016 by Mike Linkovich

declare global {
	interface Document {
		mozFullScreenElement?: Element
		msFullscreenElement?: Element
		webkitFullscreenElement?: Element
		fullscreenElement?: Element
		mozCancelFullScreen?(): void
		msExitFullscreen?(): void
		msRequestFullscreen?(): void
		mozRequestFullScreen?(): void
		webkitExitFullscreen?(): void
		//mozFullscreenEnabled?: boolean
	}
	interface Element {
		msRequestFullscreen?(): void
		mozRequestFullScreen?(): void
		webkitRequestFullscreen?(): void
	}
}

export function toggle(el: HTMLElement) {
	if (!is()) {
		/*if (document.mozFullscreenEnabled === false) {
			console.warn("Fullscreen may not be available")
		}*/
		if (el.requestFullscreen) {
			el.requestFullscreen()
		} else if (el.msRequestFullscreen) {
			el.msRequestFullscreen()
		} else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen()
		} else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen()
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen()
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen()
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen()
		}
	}
}

export function is() {
	return !!document.fullscreenElement || !!document.mozFullScreenElement ||
		!!document.webkitFullscreenElement || !!document.msFullscreenElement
}
