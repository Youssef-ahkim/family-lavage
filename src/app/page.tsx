import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Key, Car, Sparkles, MapPin, Clock, Droplets, ShieldCheck, Zap, Star, MessageCircle, Phone, ArrowRight } from "lucide-react";

export default function Home() {
  const services = [
    {
      title: "Lavage Vapeur",
      desc: "Nettoyage profond pour le moteur et l'intérieur de la voiture.",
      icon: <Droplets className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: "Lavage Extérieur",
      desc: "Protection de la peinture et brillance avec des produits de qualité.",
      icon: <Zap className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: "Lavage Intérieur",
      desc: "Nettoyage complet des sièges, du tableau de bord et du sol.",
      icon: <Sparkles className="w-6 h-6 text-brand-blue" />,
    },
    {
      title: "Bonne Odeur",
      desc: "On enlève les mauvaises odeurs et on ajoute un parfum spécial.",
      icon: <ShieldCheck className="w-6 h-6 text-brand-blue" />,
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "Donner les clés",
      desc: "Laissez vos clés à notre stand au parking Marjane.",
      icon: <Key className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "02",
      title: "Lavage Machine",
      desc: "On emmène votre voiture vers notre machine de lavage.",
      icon: <Car className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "03",
      title: "Nettoyage Main",
      desc: "On termine avec un nettoyage manuel de l'intérieur.",
      icon: <Star className="w-8 h-8 text-brand-blue" />,
    },
    {
      number: "04",
      title: "Récupération",
      desc: "Reprenez votre voiture propre après vos courses.",
      icon: <MapPin className="w-8 h-8 text-brand-blue" />,
    },
  ];

  const plans = [
    {
      name: "Une seule fois",
      price: "100",
      period: "le lavage",
      features: ["Lavage extérieur", "Lavage intérieur", "Parfum spécial"],
      cta: "Réserver",
      accent: "border-white/10",
    },
    {
      name: "Abonnement Mois",
      price: "350",
      period: "/ mois",
      features: ["1 lavage par semaine", "Lavage extérieur", "Lavage intérieur", "Parfum spécial"],
      cta: "S'abonner",
      accent: "border-brand-blue/50 ring-1 ring-brand-blue/30",
      badge: "Le plus choisi",
    },
    {
      name: "Lavage VIP",
      price: "600",
      period: "le lavage",
      features: ["Lavage vapeur complet", "Lavage moteur", "Cire de luxe", "Parfum spécial"],
      cta: "Prendre VIP",
      accent: "border-brand-gold ring-2 ring-brand-gold/50",
      badge: "Luxe",
      gold: true,
    },
    {
      name: "Abonnement Année",
      price: "3700",
      period: "/ an",
      features: ["Lavages toute l'année", "Lavage vapeur inclus", "Lavage moteur", "Cire de luxe"],
      cta: "Prendre l'année",
      accent: "border-white/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Bouton WhatsApp flottant */}
      <a
        href="https://wa.me/212600000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group animate-float"
      >
        <MessageCircle className="text-white w-7 h-7" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
          Contactez-nous
        </span>
      </a>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 overflow-hidden">
        {/* Décoration Arrière-plan */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="flex flex-col reveal delay-100">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1] mb-6 uppercase">
                LAVEZ PENDANT <br />
                <span className="text-brand-blue italic">VOS COURSES.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl leading-relaxed">
                On lave votre voiture au parking Marjane pendant que vous faites vos achats. Rapide, pro et en moins de <span className="text-white font-semibold">15 minutes</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-16">
                <button className="btn-primary group">
                  Lavage Simple
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 opacity-50 group-hover:scale-150 transition-transform" />
                  <span className="text-xs font-medium ml-2">(100DH)</span>
                </button>
                <button className="btn-outline-gold group gap-3">
                  Service VIP
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-blue">- 15m</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">Rapide</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-white italic scale-y-90 origin-left">PRO</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">Qualité</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-black text-brand-gold">VIP</span>
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">Privé</span>
                </div>
              </div>
            </div>

            <div className="relative group reveal delay-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue/30 to-brand-gold/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden border border-white/10 glass max-h-[450px]">
                <Image
                  src="/home-hero.png"
                  alt="Family Lavage Casablanca"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent " />

                <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center animate-float">
                      <Star className="text-white w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-white uppercase text-xs tracking-widest">Garanti 100%</p>
                      <p className="text-gray-400 text-sm italic">Meilleur lavage à Casablanca</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl reveal">
              <h2 className="section-heading">
                NOS <span className="text-brand-blue italic">SERVICES.</span>
              </h2>
              <p className="text-gray-400 text-lg">
                On utilise les meilleures machines et produits pour rendre votre voiture comme neuve.
              </p>
            </div>
            <Link href="#subscriptions" className="text-brand-blue font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
              Voir les prix <Zap size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-brand-blue/30 transition-all duration-300 group reveal" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="mb-6 w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:bg-brand-blue/10 transition-all">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow/Process Section */}
      <section id="process" className="py-32 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 reveal">
            <h2 className="text-sm font-black text-brand-gold uppercase tracking-[0.3em] mb-4">Comment ça marche</h2>
            <p className="section-heading italic">VOS COURSES <span className="text-brand-blue">EN TOUTE PROPRETÉ.</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative reveal" style={{ animationDelay: `${idx * 200}ms` }}>
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-brand-blue/50 to-transparent" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 group hover:border-brand-blue transition-colors">
                    <span className="absolute -top-2 left-0 text-6xl font-black text-white/5 group-hover:text-brand-blue/10 transition-colors uppercase">{step.number}</span>
                    <div className="group-hover:scale-110 transition-transform">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-tight italic">{step.title}</h3>
                  <p className="text-gray-500 text-sm max-w-[170px] mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="subscriptions" className="py-32 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="reveal">
            <h2 className="section-heading">
              CHOISISSEZ <span className="text-brand-blue italic">VOTRE PRIX.</span>
            </h2>
            <p className="text-gray-400 mb-20 max-w-2xl mx-auto">Des prix simples et des abonnements pour économiser sur le long terme.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col p-8 rounded-[2rem] bg-black border ${plan.accent} transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-brand-blue/10 ${plan.gold ? 'hover:border-brand-gold' : 'hover:border-brand-blue'} reveal`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {plan.badge && (
                  <span className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${plan.gold ? 'bg-brand-gold text-black' : 'bg-brand-blue text-white'}`}>
                    {plan.badge}
                  </span>
                )}

                <h3 className={`text-xl font-black mb-6 uppercase tracking-tight italic ${plan.gold ? 'text-brand-gold' : ''}`}>{plan.name}</h3>

                <div className="flex items-baseline justify-center gap-1 mb-10">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-gray-500 uppercase">DH</span>
                    <span className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">{plan.period}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5 mb-10" />

                <ul className="space-y-5 mb-12 flex-grow text-left">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${plan.gold ? 'bg-brand-gold' : 'bg-brand-blue'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${plan.gold
                    ? 'bg-brand-gold text-black hover:bg-white hover:scale-105 active:scale-95'
                    : plan.name === 'Abonnement Mois'
                      ? 'bg-brand-blue text-white hover:bg-brand-blue/80 hover:scale-105 active:scale-95'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95'
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Location Section */}
      <section id="contact" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-brand-blue to-teal-900 overflow-hidden relative group reveal">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[1.1] mb-8">
                  NOUS SOMMES À <br />
                  <span className="text-black">MARJANE CASABLANCA.</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/90">
                    <MapPin className="text-white fill-white/20" />
                    <span className="font-bold">Parking Marjane</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <Clock className="text-white fill-white/20" />
                    <span className="font-bold">Ouvert : 09:00 - 22:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <Phone className="text-white fill-white/20" />
                    <span className="font-bold">+212 600-000000</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <button className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-zinc-900 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                  Voir sur la carte <MapPin size={20} />
                </button>
                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white/50 text-center">
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                  Pas besoin de rendez-vous
                  <span className="w-8 h-px bg-white/20 hidden sm:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 reveal">
              <span className="text-3xl font-black tracking-tighter italic mb-6 block">
                FAMILY <span className="text-brand-blue">LAVAGE</span>
              </span>
              <p className="text-gray-500 max-w-sm mb-8">
                Lavage professionnel au parking Marjane Casablanca. Gagnez du temps pendant vos courses.
              </p>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer group">
                  <span className="text-xs font-bold">FB</span>
                </div>
              </div>
            </div>

            <div className="reveal delay-100">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-white">Menu</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link href="#services" className="hover:text-brand-blue transition-colors">Services</Link></li>
                <li><Link href="#process" className="hover:text-brand-blue transition-colors">Comment ça marche</Link></li>
                <li><Link href="#subscriptions" className="hover:text-brand-blue transition-colors">Prix</Link></li>
              </ul>
            </div>

            <div className="reveal delay-200">
              <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-white">Légal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-brand-blue transition-colors">Conditions</Link></li>
                <li><Link href="#" className="hover:text-brand-blue transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-gray-600 text-xs font-medium">
              © 2026 FAMILY LAVAGE GROUP. TOUS DROITS RÉSERVÉS.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>CASABLANCA, MAROC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}