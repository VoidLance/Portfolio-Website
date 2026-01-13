// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function LAWSBook() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">
        L.A.W.S
      </h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-1/3 flex-shrink-0">
            <img 
              src="/laws-cover.png" 
              alt="L.A.W.S Book Cover"
              className="w-full rounded-lg shadow-lg border-2 border-indie-accent-green/30"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl text-indie-accent-green mb-4">About the Book</h2>
            <p className="mb-4 leading-relaxed">
              <span className="text-indie-accent-green font-semibold">Author:</span> Alistair Sweeting
            </p>
            <p className="mb-4 leading-relaxed">
              In a dystopian future where Britain has collapsed under an oppressive government, 
              Tom Elwood leads the Copper Fist—a crew of skilled criminals fighting for survival 
              and the common people. When Tom discovers the legendary Elwood Sword in a Sheffield 
              scrapyard, he unknowingly triggers a collision between two worlds: the gritty streets 
              of a fallen nation and an institution operating from the heights of power and privilege 
              on the other side of the Atlantic.
            </p>
          </div>
        </div>

        <h2 className="text-2xl text-indie-accent-green mb-4">Full Synopsis</h2>
        
        <div className="space-y-4 leading-relaxed">
          <p>
            <strong className="text-indie-accent-green">Tom Elwood's World:</strong> After escaping 
            from Britain's highest security prison with his reunited crew — the Copper Fist — Tom returns 
            to Sheffield to support his family through increasingly dangerous jobs. The country has 
            descended into chaos under governmental tyranny, where suspected terrorism charges are 
            weaponized against anyone who challenges the system. Tom and his crew—Butcher (a demolitions expert with a soft heart 
            and a fierce sense of loyalty), Dave (a brawler who solves most problems through direct force), 
            Kestrel (a young hacker with something to prove), Silas (an actor who commits fully to every role), 
            Brian (the crew's connection to the underworld), and Chris—are survivors in a world where resistance is measured 
            in credits and careful planning. Tom himself is down to earth and pragmatic, but harbors a deep fascination 
            with things most people dismiss as fantasy or myth. It's a fascination his late father never quite approved of.
          </p>

          <p>
            <strong className="text-indie-accent-green">The Discovery:</strong> While working a job 
            at Dev's scrapyard, sifting through abandoned car parts and electronics, Tom uncovers an 
            ornate golden box containing an elaborately decorated broadsword—a piece of craftsmanship 
            that doesn't match anything in the scrapyard's inventory, quality, or origin. The metalwork is 
            extraordinary. The design is archaic. And when he finds the name engraved along the fuller, his blood goes cold:  
            <em>Elwood</em>. His family name. A sword that shouldn't exist, bearing his bloodline, lost in a wasteland for 
            reasons no one in his family ever mentioned. His brother Mike warned him: anything this valuable that's lost in the wasteland 
            attracts the kind of attention that kills people.
          </p>

          <p>
            <strong className="text-indie-accent-green">L.A.W.S:</strong> Across 
            the Atlantic, four elite students from a prestigious institution are on the hunt. Liam, 
            their charismatic leader — flamboyant, practiced in martial arts, confident in his methods. Jackie, 
            a playful but deadly operative with a knack for getting results. Abi, fiery and rebellious despite 
            her official role, never one to follow orders blindly. And Rose, their brilliant analyst whose 
            composure and strategic mind guide them from afar through a communication headset, unassuming yet indispensable. 
            Together they form a recovery unit trained to track and retrieve something very specific. Their methods are cutting-edge. 
            Their resources are vast. And they've been searching for this artifact far longer than anyone in Britain even knew it existed.
          </p>

          <p>
            <strong className="text-indie-accent-green">The Convergence:</strong> As the team 
            systematically closes in on their target, Tom's brother Mike realizes the danger: 
            "Just get rid of it, Tom! We can't have that kind of attention here." But holding onto 
            the sword is no longer an option, and neither is letting it go. Two very different worlds —
            one fighting for survival through cunning and crime, one operating with resources and capabilities 
            that Tom can barely comprehend — are about to collide over an artifact that both sides have been 
            seeking for entirely different reasons. And Tom is standing in the middle.
          </p>

          <p>
            <strong className="text-indie-accent-green">Themes:</strong> L.A.W.S examines the 
            collision between those fighting for survival and those operating from positions of absolute 
            power. It explores themes of resistance against oppression, loyalty and betrayal, what it means 
            to be an underdog, and whether ancient power can serve those who've been abandoned by the modern world. 
            Most importantly, it asks: who really owns the future — those with resources, or those with nothing left to lose?
          </p>

          <p>
            The narrative weaves between gritty heist planning and high-stakes institutional politics, between 
            the desperate survival of Britain's underclass and the privileged missions of an elite American 
            organization, building toward an inevitable confrontation that will test both sides' 
            understanding of justice, power, and what it means to be human in a world far more complex 
            than either side realizes.
          </p>
        </div>

        <div className="mt-8 p-6 bg-indie-bg-nav rounded-lg border border-indie-accent-green/30">
          <h2 className="text-2xl text-indie-accent-green mb-4">Story Elements</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>The Copper Fist:</strong> Named after "a beggar with a handful of pennies 
            closed tight to his chest" — representing champions of the common people fighting against 
            systemic oppression</li>
            <li><strong>Credits Currency:</strong> An underworld cryptocurrency similar to Bitcoin, 
            disconnected from government control and used for operations outside legal reach</li>
            <li><strong>Fallen Britain:</strong> A nation transformed into a wasteland under 
            oppressive government rule, where scrapyards have become makeshift towns and survival 
            means breaking laws</li>
            <li><strong>The Elwood Sword:</strong> An artifact of significant historical and mysterious 
            significance, sought by powerful interests for reasons Tom will come to understand</li>
            <li><strong>Two Opposing Forces:</strong> One side operates from desperation and survival instinct; 
            the other from institutional resources and methods Tom doesn't initially understand—yet both are 
            equally determined to possess the sword</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-indie-text-gray/70 italic mb-4">
            Status: Work in Progress
          </p>
          <p className="text-indie-text-gray/80">
            L.A.W.S is a story about discovering that the world is far stranger, more capable, 
            and more dangerous than you ever imagined—and having to survive when two incompatible 
            sides collide over something neither of them fully understands.
          </p>
        </div>
      </article>
    </PageWrapper>
  )
}
