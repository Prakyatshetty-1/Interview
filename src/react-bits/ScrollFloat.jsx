import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 0.8, // ⚡ Slightly faster
  ease = 'power3.out',     // ⚡ Smoother and more performant than 'back.inOut'
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03
}) => {
  const containerRef = useRef(null);

  // 🧠 Efficiently splits text into span-wrapped characters
  const splitText = useMemo(() => {
    const elements = [];

    const processNode = (node) => {
      if (typeof node === "string") {
        node.split("").forEach((char) => {
          elements.push(
            <span className="char" key={elements.length}>
              {char === " " ? "\u00A0" : char}
            </span>
          );
        });
      } else if (node?.type === "br") {
        elements.push(<br key={elements.length} />);
      } else if (node?.props?.children) {
        const childrenArray = Array.isArray(node.props.children)
          ? node.props.children
          : [node.props.children];
        childrenArray.forEach(processNode);
      }
    };

    const contentArray = Array.isArray(children) ? children : [children];
    contentArray.forEach(processNode);

    return elements;
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current ?? window;

    const charElements = el.querySelectorAll('.char');

    const ctx = gsap.context(() => {
      // 🧹 From: exaggerated, performance-friendly transformation
      gsap.fromTo(
        charElements,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 1.8,
          scaleX: 0.7,
          transformOrigin: '50% 100%' // ✅ More natural vertical origin
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.4, // ⚡ Faster update frequency
          }
        }
      );
    }, el);

    // 🧹 Clean-up ScrollTrigger and context on unmount
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} className={`scroll-float ${containerClassName}`}>
      <span className={`scroll-float-text ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
};

export default ScrollFloat;
