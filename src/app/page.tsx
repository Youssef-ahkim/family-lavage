"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Key, Car, Sparkles, MapPin, Clock, Droplets, ShieldCheck, Zap, Star, MessageCircle, Phone, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function Home() {
  const { language, dir } = useLanguage();
  const t = translations[language];

  const services = [
    {
      title: t.services.items[0].title,
      desc: t.services.items[0].desc,
      icon: <Droplets className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: t.services.items[1].title,
      desc: t.services.items[1].desc,
      icon: <Zap className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: t.services.items[2].title,
      desc: t.services.items[2].desc,
      icon: <Sparkles className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: t.services.items[3].title,
      desc: t.services.items[3].desc,
      icon: <ShieldCheck className="w-6 h-6 text-brand-blue" />,
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: t.process.steps[0].title,
      desc: t.process.steps[0].desc,
      icon: <Key className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "02",
      title: t.process.steps[1].title,
      desc: t.process.steps[1].desc,
      icon: <Car className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "03",
      title: t.process.steps[2].title,
      desc: t.process.steps[2].desc,
      icon: <Star className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "04",
      title: t.process.steps[3].title,
      desc: t.process.steps[3].desc,
      icon: <MapPin className="w-8 h-8 text-brand-blue" />,
    },
  ];

  const plans = [
    {
      name: t.pricing.plans.once.name,
      price: "100",
      period: t.pricing.perWash,
      features: t.pricing.plans.once.features,
      cta: t.pricing.ctas.book,
      accent: "border-white/10",
    },
    {
      name: t.pricing.plans.month.name,
      price: "350",
      period: t.pricing.perMonth,
      features: t.pricing.plans.month.features,
      cta: t.pricing.ctas.subscribe,
      accent: "border-brand-blue/50 ring-1 ring-brand-blue/30",
      badge: t.pricing.badges.mostChosen,
    },
    {
      name: t.pricing.plans.vip.name,
      price: "600",
      period: t.pricing.perWash,
      features: t.pricing.plans.vip.features,
      cta: t.pricing.ctas.takeVip,
      accent: "border-brand-gold ring-2 ring-brand-gold/50",
      badge: t.pricing.badges.luxe,
      gold: true,
    },
    {
      name: t.pricing.plans.year.name,
      price: "3700",
      period: t.pricing.perYear,
      features: t.pricing.plans.year.features,
      cta: t.pricing.ctas.takeYear,
      accent: "border-white/20",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden">
      <Navbar />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/212600000000"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-8 ${dir === 'rtl' ? 'left-8' : 'right-8'} z-[60] bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group animate-float`}
      >
        <MessageCircle className="text-white w-7 h-7" />
        <span className={`absolute ${dir === 'rtl' ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-200 shadow-xl text-zinc-900`}>
          {language === 'fr' ? 'Contactez-nous' : (language === 'ar' ? 'تواصل معنا' : 'Contact Us')}
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className={`flex flex-col reveal delay-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1] mb-6 uppercase">
                {t.hero.title} <br />
                <span className="text-brand-blue italic">{t.hero.titleAccent}</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-500 mb-8 max-w-xl leading-relaxed">
                {t.hero.desc} <span className="text-zinc-900 font-semibold">{t.hero.descAccent}</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-16">
                <button className="btn-primary group">
                  {t.hero.btnSimple}
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 opacity-50 group-hover:scale-150 transition-transform" />
                  <span className="text-xs font-medium ml-2">(100DH)</span>
                </button>
                <button className="btn-outline-gold group gap-3">
                  {t.hero.btnVip}
                  <ArrowRight size={18} className={`${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-200">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-blue">- 15m</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.fast}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-zinc-900 italic scale-y-90 origin-left">PRO</span>
                  <span className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">{t.hero.stats.quality}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-gold">VIP</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">{t.hero.stats.private}</span>
                </div>
              </div>
            </div>

            <div className="relative group reveal delay-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/20 to-brand-gold/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl shadow-zinc-200 glass max-h-[450px]">
                <Image
                  src="/home-hero.png"
                  alt="Family Lavage Casablanca"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent " />

                <div className={`absolute bottom-8 ${dir === 'rtl' ? 'right-8 left-auto' : 'left-8 right-auto'} p-6 glass rounded-2xl border border-zinc-200/50 shadow-xl`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center animate-float">
                      <Star className="text-white w-6 h-6 fill-current" />
                    </div>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                      <p className="font-bold text-zinc-900 uppercase text-xs tracking-widest">{t.hero.guarantee}</p>
                      <p className="text-zinc-600 text-sm italic">{t.hero.subGuarantee}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className={`max-w-2xl reveal ${dir === 'rtl' ? 'text-right md:order-2' : ''}`}>
              <h2 className="section-heading">
                {t.services.title} <span className="text-brand-blue italic">{t.services.titleAccent}</span>
              </h2>
              <p className="text-zinc-500 text-lg">
                {t.services.desc}
              </p>
            </div>
            <Link href="#subscriptions" className={`text-brand-blue font-bold flex items-center gap-2 transition-transform ${dir === 'rtl' ? 'hover:-translate-x-1' : 'hover:translate-x-1'}`}>
              {t.services.viewPricing} <Zap size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className={`p-8 rounded-3xl bg-zinc-50 border border-zinc-200 hover:border-brand-blue/30 transition-all duration-300 group reveal ${dir === 'rtl' ? 'text-right' : ''}`} style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`mb-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-zinc-200 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all shadow-sm ${dir === 'rtl' ? 'mr-0 ml-auto' : ''}`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">{service.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow/Process Section */}
      <section id="process" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 reveal">
            <h2 className="text-sm font-black text-brand-gold uppercase tracking-[0.3em] mb-4">{t.process.badge}</h2>
            <p className="section-heading italic">{t.process.title} <span className="text-brand-blue">{t.process.titleAccent}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative reveal" style={{ animationDelay: `${idx * 200}ms` }}>
                {idx < processSteps.length - 1 && (
                  <div className={`hidden lg:block absolute top-12 ${dir === 'rtl' ? 'right-1/2 left-auto' : 'left-1/2 right-auto'} w-full h-px bg-gradient-to-r from-brand-blue/30 to-transparent ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-8 group hover:border-brand-blue transition-colors shadow-sm">
                    <span className={`absolute -top-2 ${dir === 'rtl' ? 'right-0' : 'left-0'} text-6xl font-black text-zinc-100 group-hover:text-brand-blue/10 transition-colors uppercase`}>{step.number}</span>
                    <div className="group-hover:scale-110 transition-transform">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-tight italic text-zinc-900">{step.title}</h3>
                  <p className="text-zinc-500 text-sm max-w-[170px] mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="subscriptions" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="reveal">
            <h2 className="section-heading">
              {t.pricing.title} <span className="text-brand-blue italic">{t.pricing.titleAccent}</span>
            </h2>
            <p className="text-zinc-500 mb-20 max-w-2xl mx-auto">{t.pricing.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col p-8 rounded-[2rem] bg-white border ${plan.accent === 'border-white/10' ? 'border-zinc-200' : plan.accent} transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-brand-blue/10 ${plan.gold ? 'hover:border-brand-gold' : 'hover:border-brand-blue'} reveal`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {plan.badge && (
                  <span className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${plan.gold ? 'bg-brand-gold text-black' : 'bg-brand-blue text-white'}`}>
                    {plan.badge}
                  </span>
                )}

                <h3 className={`text-xl font-black mb-6 uppercase tracking-tight italic ${plan.gold ? 'text-brand-gold' : ''}`}>{plan.name}</h3>

                <div className="flex items-baseline justify-center gap-1 mb-10">
                  <span className="text-5xl font-black tracking-tighter text-zinc-900">{plan.price}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-zinc-400 uppercase">DH</span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{plan.period}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-100 mb-10" />

                <ul className="space-y-5 mb-12 flex-grow text-left">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className={`flex items-center gap-3 text-sm text-zinc-600 font-medium ${dir === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${plan.gold ? 'bg-brand-gold' : 'bg-brand-blue'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${plan.gold
                  ? 'bg-brand-gold text-black hover:bg-white hover:scale-105 active:scale-95'
                  : plan.name.includes('Mois') || plan.name.includes('Month') || plan.name.includes('شهري')
                    ? 'bg-brand-blue text-white hover:bg-brand-blue/80 hover:scale-105 active:scale-95'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 hover:scale-105 active:scale-95'
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Location Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-blue to-teal-900 overflow-hidden relative group reveal">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />

            <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[1.1] mb-8">
                  {t.contact.title} <br />
                  <span className="text-black">{t.contact.titleAccent}</span>
                </h2>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="text-white fill-white/20" />
                    <span className="font-bold">{t.contact.location}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Clock className="text-white fill-white/20" />
                    <span className="font-bold">{t.contact.open}</span>
                  </div>
                  <div className={`flex items-center gap-3 text-white/90 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Phone className="text-white fill-white/20" />
                    <span className="font-bold">+212 600-000000</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <button className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-zinc-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                  {t.contact.map} <MapPin size={20} />
                </button>
                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white/50 text-center">
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                  {t.contact.noAppt}
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div className="md:col-span-2 reveal">
              <span className={`text-3xl font-black tracking-tighter italic mb-6 block text-zinc-900`}>
                FAMILY <span className="text-brand-blue">LAVAGE</span>
              </span>
              <p className="text-zinc-500 max-w-sm mb-8">
                {t.footer.desc}
              </p>
              <div className={`flex gap-4 ${dir === 'rtl' ? 'justify-end' : ''}`}>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
                  <span className="text-xs font-bold">FB</span>
                </div>
              </div>
            </div>

            <div className="reveal delay-100">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-zinc-900">{t.footer.menu}</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link href="#services" className="hover:text-brand-blue transition-colors">{t.nav.services}</Link></li>
                <li><Link href="#process" className="hover:text-brand-blue transition-colors">{t.nav.process}</Link></li>
                <li><Link href="#subscriptions" className="hover:text-brand-blue transition-colors">{t.nav.pricing}</Link></li>
              </ul>
            </div>

            <div className="reveal delay-200">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-zinc-900">{t.footer.legal}</h4>
              <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                <li><Link href="#" className="hover:text-brand-blue transition-colors">{t.footer.terms}</Link></li>
                <li><Link href="#" className="hover:text-brand-blue transition-colors">{t.footer.privacy}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-zinc-400 text-xs font-medium">
              © 2026 FAMILY LAVAGE GROUP. {t.footer.rights}
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <span>{language === 'ar' ? 'الدار البيضاء، المغرب' : 'CASABLANCA, MOROCCO'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
