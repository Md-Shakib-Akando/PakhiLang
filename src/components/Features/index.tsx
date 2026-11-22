import Icon from "@/components/Icon";
import SectionHeading from "@/components/SectionHeading";
import SpotlightCard from "@/components/SpotlightCard";
import { FEATURES } from "@/constants/features";
import { CONTAINER, GRADIENT_TEXT, SECTION, reveal } from "@/lib/ui";

export default function Features() {
  return (
    <section id="features" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Chhoto language, <span className={GRADIENT_TEXT}>kintu shob ache</span>
            </>
          }
          description="Variables, condition, loop, function, closure: ekta asol language er shob basic jinish. Sathe shekhar jonno bhitorer shob kichu khola."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            // the wrapper scroll-reveals; the card itself lifts on hover
            <div key={feature.title} className={reveal(i % 3)}>
              <SpotlightCard className="h-full rounded-[14px] border border-line bg-linear-to-b from-white/[0.035] to-white/[0.01] p-[22px] transition duration-300 hover:-translate-y-1 hover:border-pink/30 sm:p-7">
                <div className="grid size-[42px] place-items-center rounded-[11px] border border-pink/20 bg-pink/10 text-pink transition duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-pink/15">
                  <Icon name={feature.icon} size={20} />
                </div>
                <h3 className="mt-5 mb-2 text-[17px] font-semibold tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{feature.description}</p>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
