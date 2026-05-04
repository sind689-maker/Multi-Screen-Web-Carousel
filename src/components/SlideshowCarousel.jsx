import { useEffect, useRef } from 'react'
import Swiper from 'swiper'
import {
  Navigation, Pagination, Autoplay,
  EffectFade, EffectCube, EffectFlip, EffectCoverflow,
} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-flip'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './SlideshowCarousel.module.css'

// Map transition names to Swiper effect names
const EFFECT_MAP = {
  fade: 'fade',
  slide: 'slide',
  cube: 'cube',
  flip: 'flip',
  coverflow: 'coverflow',
}

export default function SlideshowCarousel({ images, duration, transition, showControls = false }) {
  const swiperRef = useRef(null)
  const swiperInstanceRef = useRef(null)

  useEffect(() => {
    if (!swiperRef.current || images.length === 0) return

    const effect = EFFECT_MAP[transition] || 'fade'
    const delayMs = (duration || 5) * 1000

    const swiper = new Swiper(swiperRef.current, {
      modules: [Navigation, Pagination, Autoplay, EffectFade, EffectCube, EffectFlip, EffectCoverflow],
      loop: true,
      effect,
      speed: 800,
      autoplay: {
        delay: delayMs,
        disableOnInteraction: false,
        pauseOnMouseEnter: showControls,
      },
      ...(effect === 'fade' && { fadeEffect: { crossFade: true } }),
      ...(effect === 'coverflow' && {
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
        centeredSlides: true,
        slidesPerView: 'auto',
      }),
      ...(showControls && {
        navigation: {
          nextEl: `.${styles.next}`,
          prevEl: `.${styles.prev}`,
        },
        pagination: {
          el: `.${styles.pagination}`,
          clickable: true,
        },
      }),
    })

    swiperInstanceRef.current = swiper

    return () => {
      swiper.destroy(true, true)
      swiperInstanceRef.current = null
    }
  }, [images, duration, transition, showControls])

  if (images.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No images to display.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={`swiper ${styles.swiper}`} ref={swiperRef}>
        <div className="swiper-wrapper">
          {images.map((img, index) => (
            <div key={index} className={`swiper-slide ${styles.slide}`}>
              <img
                src={img.url}
                alt={img.name || `Slide ${index + 1}`}
                className={styles.image}
                draggable={false}
              />
            </div>
          ))}
        </div>
        {showControls && (
          <>
            <button className={`swiper-button-prev ${styles.prev}`} />
            <button className={`swiper-button-next ${styles.next}`} />
            <div className={`swiper-pagination ${styles.pagination}`} />
          </>
        )}
      </div>
    </div>
  )
}
