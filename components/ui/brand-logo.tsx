"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface BrandLogoProps {
    width?: number
    height?: number
    className?: string
}

export function BrandLogo({ width = 140, height = 35, className }: BrandLogoProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Image src="/logo.svg" alt="Chartyaka" width={width} height={height} className={className} priority />
    }

    // Use the new light logo for light theme, regular logo for dark theme
    const src = resolvedTheme === "light" ? "/logo-light.png" : "/logo.svg"

    return (
        <Image
            src={src}
            alt="Chartyaka"
            width={width}
            height={height}
            className={className}
            priority
        />
    )
}
