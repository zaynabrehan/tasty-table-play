import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim(),
    });
    setSending(false);

    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          Contact <span className="text-gradient-fire">Us</span>
        </h1>
        <p className="text-muted-foreground font-body">We'd love to hear from you</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Contact Info */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-foreground">Get in Touch</h2>
          <div className="space-y-4">
            {[
              { icon: Phone, label: "Johar Town Branch", value: "0326 9946142", href: "tel:03269946142" },
              { icon: Phone, label: "DHA Branch", value: "0325 7217221", href: "tel:03257217221" },
              {
                icon: Clock,
                label: "Opening Hours",
                value: (
                  <>
                    Monday – Thursday: 12:00 PM – 2:00 AM <br />
                    Friday – Sunday: 3:00 PM – 2:00 AM
                  </>
                ),
              },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 glass-card rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-fire flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">{label}</p>
                  {href ? (
                    <a href={href} className="text-foreground font-body font-medium hover:text-primary transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-foreground font-body font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-display font-semibold text-foreground">Our Branches</h3>
            {[
              { name: "Johar Town", address: "R-2 Johar Town, Near Shaukat Khanum, Lahore" },
              { name: "DHA", address: "100-H, DHA, Phase 01, Lahore" },
            ].map((b) => (
              <div key={b.name} className="flex items-start gap-3 glass-card rounded-xl p-4">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-medium text-foreground">{b.name}</p>
                  <p className="text-sm text-muted-foreground font-body">{b.address}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="glass-card rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-display font-bold text-foreground mb-6">Send a Message</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1.5 block">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all"
                placeholder="Your name"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1.5 block">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all"
                placeholder="your@email.com"
                required
                maxLength={255}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all"
                placeholder="03xx xxxxxxx"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1.5 block">Message *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-body placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-fire transition-all resize-none"
                placeholder="Your message..."
                required
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-gradient-fire text-primary-foreground py-3 rounded-xl font-bold font-body hover:shadow-fire hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
