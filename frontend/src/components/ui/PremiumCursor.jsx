import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring
} from "framer-motion";

export default function PremiumCursor() {

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const x = useSpring(mx,{
    stiffness:220,
    damping:24,
    mass:0.6
  });

  const y = useSpring(my,{
    stiffness:220,
    damping:24,
    mass:0.6
  });

  const [visible,setVisible] = useState(false);
  const [hovered,setHovered] = useState(false);

  const rotate = useMotionValue(0);

  const previous = useRef({
    x:0,
    y:0
  });

  useEffect(()=>{

    const move = (e)=>{

      mx.set(e.clientX);
      my.set(e.clientY);

      setVisible(true);

      const dx =
        e.clientX -
        previous.current.x;

      const dy =
        e.clientY -
        previous.current.y;

      const angle =
        Math.atan2(dy,dx) *
        (180/Math.PI);

      /*
      limit rotation
      */

      const limited =
        Math.max(
          -18,
          Math.min(
            18,
            angle
          )
        );

      rotate.set(limited);

      previous.current = {

        x:e.clientX,

        y:e.clientY

      };

    };

    window.addEventListener(
      "mousemove",
      move
    );

    return ()=>{

      window.removeEventListener(
        "mousemove",
        move
      );

    };

  },[]);

  useEffect(()=>{

    const items =
      document.querySelectorAll(

        "a,button,.cursor-hover"

      );

    const enter =
      ()=>setHovered(true);

    const leave =
      ()=>setHovered(false);

    items.forEach(el=>{

      el.addEventListener(

        "mouseenter",

        enter

      );

      el.addEventListener(

        "mouseleave",

        leave

      );

    });

    return ()=>{

      items.forEach(el=>{

        el.removeEventListener(

          "mouseenter",

          enter

        );

        el.removeEventListener(

          "mouseleave",

          leave

        );

      });

    };

  },[]);

  return (

    <motion.div

      style={{

        x,

        y,

        rotate,

        position:"fixed",

        top:0,

        left:0,

        zIndex:999999,

        pointerEvents:"none",

        translateX:-8,

        translateY:-8

      }}

      animate={{

        opacity:

          visible
          ? 1
          : 0,

        scale:

          hovered
          ? 1.12
          : 1

      }}

      transition={{

        scale:{

          type:"spring",

          stiffness:500,

          damping:22

        }

      }}

    >

      <svg

        width="34"

        height="34"

        viewBox="0 0 40 40"

        fill="none"

        style={{

          filter:

            hovered

            ?

            `drop-shadow(
              0 0 10px
              rgba(255,255,255,.45)
            )`

            :

            `drop-shadow(
              0 0 6px
              rgba(255,255,255,.15)
            )`

        }}

      >

        <defs>

          <linearGradient

            id="cursor"

            x1="0"

            y1="0"

            x2="1"

            y2="1"

          >

            <stop

              offset="0%"

              stopColor="#06b6a8"

            />

            <stop

              offset="60%"

              stopColor="#ECECEC"

            />

            <stop

              offset="100%"

              stopColor="#C7CCD4"

            />

          </linearGradient>

        </defs>

        <path

          d="M29 4
             L11 18
             L22 21
             L29 35
             Z"

          fill="url(#cursor)"

          stroke="#4277d8"

          strokeWidth="1.2"

          strokeLinejoin="round"

        />

      </svg>

    </motion.div>

  );

}