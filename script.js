(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduced) document.body.classList.add("reduced");

  /* share the embedded portrait with the about section (no duplication) */
  var heroImg = document.getElementById("heroImg");
  document.getElementById("aboutImg").src = heroImg.src;

  /* ---------- Lagos clock ---------- */
  var clock = document.getElementById("clock");
  function tickClock(){
    try {
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).format(new Date());
    } catch(e) { clock.textContent = new Date().toLocaleTimeString(); }
  }
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var menuClose = document.getElementById("menuClose");
  var mobileMenu = document.getElementById("mobileMenu");
  function setMenu(open){
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("locked", open);
  }
  menuBtn.addEventListener("click", function(){ setMenu(true); });
  menuClose.addEventListener("click", function(){ setMenu(false); });
  mobileMenu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ setMenu(false); });
  });

  /* ---------- split text helpers ---------- */
  function splitChars(el){
    var text = el.textContent;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = text[i] === " " ? " " : text[i];
      frag.appendChild(s);
    }
    el.appendChild(frag);
    return el.querySelectorAll(".ch");
  }
  /* word-mask split that keeps <em> styling: wraps each word in .word > i */
  function splitWords(el){
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = "";
    nodes.forEach(function(node){
      var isEm = node.nodeType === 1 && node.tagName === "EM";
      var text = node.textContent;
      var words = text.split(/(\s+)/);
      words.forEach(function(w){
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; }
        if (!w) return;
        var mask = document.createElement("span");
        mask.className = "word";
        var inner = document.createElement("i");
        inner.textContent = w;
        if (isEm) {
          var em = document.createElement("em");
          em.appendChild(inner);
          mask.appendChild(em);
        } else {
          mask.appendChild(inner);
        }
        el.appendChild(mask);
        el.appendChild(document.createTextNode(" "));
      });
    });
    return el.querySelectorAll(".word > i, .word em > i, .word > em > i".split(",")[0]) ;
  }

  var backChars = splitChars(document.getElementById("nameBack"));
  var frontChars = splitChars(document.getElementById("nameFront"));
  /* make a couple of front chars solid bronze for rhythm */
  if (frontChars.length > 3) { frontChars[0].classList.add("solid"); frontChars[frontChars.length-1].classList.add("solid"); }

  document.querySelectorAll("[data-split]").forEach(function(h){ splitWords(h); });

  /* ---------- custom cursor ---------- */
  if (finePointer && !reduced) {
    var cursor = document.querySelector(".cursor");
    var dot = cursor.querySelector(".cursor-dot");
    var ring = cursor.querySelector(".cursor-ring");
    var label = cursor.querySelector(".cursor-label");
    var mx=-100,my=-100,rx=-100,ry=-100;
    window.addEventListener("pointermove", function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});
    (function loop(){
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      dot.style.left=mx+"px"; dot.style.top=my+"px";
      ring.style.left=rx+"px"; ring.style.top=ry+"px";
      label.style.left=rx+"px"; label.style.top=ry+"px";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-hover]").forEach(function(el){
      el.addEventListener("mouseenter", function(){ cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function(){ cursor.classList.remove("is-hover"); });
    });
    document.querySelectorAll("[data-view]").forEach(function(el){
      el.addEventListener("mouseenter", function(){ cursor.classList.add("is-view"); });
      el.addEventListener("mouseleave", function(){ cursor.classList.remove("is-view"); });
    });
  }

  /* ---------- magnetic elements ---------- */
  if (finePointer && !reduced && window.gsap) {
    document.querySelectorAll("[data-magnet]").forEach(function(el){
      var strength = 22;
      el.addEventListener("pointermove", function(e){
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width/2);
        var y = e.clientY - (r.top + r.height/2);
        gsap.to(el, { x: x/r.width*strength, y: y/r.height*strength, duration: .4, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", function(){
        gsap.to(el, { x: 0, y: 0, duration: .6, ease: "elastic.out(1,.4)" });
      });
    });
  }

  /* ---------- GSAP master ---------- */
  if (window.gsap && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* preloader */
    var loader = document.getElementById("loader");
    var num = document.getElementById("loaderNum");
    var bar = document.getElementById("loaderBar");
    var counter = { v: 0 };

    var intro = gsap.timeline({ defaults: { ease: "power4.out" } });

    intro
      .to(counter, {
        v: 100, duration: 1.6, ease: "power2.inOut",
        onUpdate: function(){
          var v = Math.round(counter.v);
          num.textContent = String(v).padStart(3, "0");
          bar.style.width = v + "%";
        }
      })
      .to(loader, { yPercent: -100, duration: .9, ease: "power4.inOut" }, "+=0.15")
      .add(function(){ document.body.classList.remove("locked"); loader.style.display = "none"; })
      /* hero choreography */
      .fromTo("#portrait",
        { clipPath: "inset(50% 0 50% 0)" },
        { clipPath: "inset(0% 0 0% 0)", duration: 1.2, ease: "power4.inOut" }, "-=0.55")
      .to("#heroImg", { scale: 1.08, duration: 1.6, ease: "power3.out" }, "<")
      .from(backChars, { yPercent: 120, rotate: 6, duration: 1, stagger: .045, ease: "power4.out" }, "-=0.9")
      .from(frontChars, { yPercent: -120, rotate: -6, duration: 1, stagger: .04, ease: "power4.out" }, "-=0.85")
      .from("#heroSerif", { opacity: 0, y: 18, duration: .8 }, "-=0.6")
      .from("#metaL, #metaR", { opacity: 0, y: 16, duration: .7, stagger: .1 }, "-=0.6")
      .from(".scroll-cue", { opacity: 0, duration: .6 }, "-=0.4")
      .to("#nav", { opacity: 1, duration: .7 }, "-=0.5");

    /* hero mouse parallax (depth sandwich) */
    var stage = document.getElementById("heroStage");
    var qBack = gsap.quickTo("#nameBack", "x", { duration: .7, ease: "power3.out" });
    var qBackY = gsap.quickTo("#nameBack", "y", { duration: .7, ease: "power3.out" });
    var qFront = gsap.quickTo("#nameFront", "x", { duration: .5, ease: "power3.out" });
    var qFrontY = gsap.quickTo("#nameFront", "y", { duration: .5, ease: "power3.out" });
    var qImg = gsap.quickTo("#portrait", "x", { duration: .9, ease: "power3.out" });
    var qImgY = gsap.quickTo("#portrait", "y", { duration: .9, ease: "power3.out" });
    if (finePointer) {
      stage.addEventListener("pointermove", function(e){
        var nx = (e.clientX / window.innerWidth - .5);
        var ny = (e.clientY / window.innerHeight - .5);
        qBack(nx * -34); qBackY(ny * -16);
        qFront(nx * 46); qFrontY(ny * 22);
        qImg(nx * 14); qImgY(ny * 8);
      });
    }

    /* hero scroll exit: layers separate */
    gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    })
    .to("#nameBack", { yPercent: -55, opacity: .15 }, 0)
    .to("#nameFront", { yPercent: 70, opacity: .15 }, 0)
    .to("#heroImg", { scale: 1.22 }, 0)
    .to("#heroSerif, .hero-meta, .scroll-cue", { opacity: 0 }, 0);

    /* split-heading reveals on scroll */
    document.querySelectorAll("[data-split]").forEach(function(h){
      var inners = h.querySelectorAll(".word i");
      gsap.from(inners, {
        yPercent: 120, rotate: 4, duration: .9, stagger: .05, ease: "power4.out",
        scrollTrigger: { trigger: h, start: "top 88%" }
      });
    });

    /* generic reveals */
    gsap.utils.toArray(".reveal").forEach(function(el){
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* about photo: curtain reveal + inner parallax */
    gsap.to("#aboutPhoto", {
      clipPath: "inset(0% 0 0% 0)", duration: 1.3, ease: "power4.inOut",
      scrollTrigger: { trigger: "#aboutPhoto", start: "top 82%" }
    });
    gsap.fromTo("#aboutImg", { yPercent: -10 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: "#aboutPhoto", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* project visuals: clip reveal from bottom */
    gsap.utils.toArray(".p-visual").forEach(function(v){
      gsap.to(v, {
        clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power4.inOut",
        scrollTrigger: { trigger: v, start: "top 86%" }
      });
    });

    /* counters */
    gsap.utils.toArray("#stats [data-count]").forEach(function(el){
      var target = parseInt(el.getAttribute("data-count"), 10);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.7, ease: "power2.out",
        scrollTrigger: { trigger: "#stats", start: "top 86%" },
        onUpdate: function(){ el.textContent = Math.round(obj.v).toLocaleString(); }
      });
    });

  } else {
    /* reduced motion / no GSAP: everything visible, final values */
    document.getElementById("loader").style.display = "none";
    document.body.classList.remove("locked");
    document.getElementById("nav").style.opacity = 1;
    document.querySelectorAll(".reveal").forEach(function(el){ el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll(".about-photo, .p-visual").forEach(function(el){ el.style.clipPath = "none"; });
    document.querySelectorAll("#stats [data-count]").forEach(function(el){
      el.textContent = parseInt(el.getAttribute("data-count"), 10).toLocaleString();
    });
  }
})();
