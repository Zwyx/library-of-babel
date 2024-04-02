#!/bin/sh

npx pwa-asset-generator --opaque false --icon-only --favicon --padding '0' --type png res/library.svg public

npx pwa-asset-generator --background '#020817' --padding '17%' --type png res/library.svg public

roundCorners () {
	/opt/magick/magick convert -size "$2" xc:none -draw "roundrectangle 0,0,$3" tmp-mask.png
	/opt/magick/magick convert "$1" -matte tmp-mask.png -compose DstIn -composite "$1"
	rm tmp-mask.png
}

roundCorners public/manifest-icon-192.maskable.png 192x192 192,192,24,24
roundCorners public/manifest-icon-512.maskable.png 512x512 512,512,64,64
roundCorners public/apple-icon-180.png 180x180 180,180,22,22
