// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'
import lawsCover from '../../Images/laws-cover.jpg'

export default function LAWSBook() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">
        L.A.W.S - Los Angeles Witch School
      </h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="md:w-1/3 flex-shrink-0">
            <img 
              src={lawsCover} 
              alt="L.A.W.S Book Cover - Cybernetic hand holding magical energy"
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
              of a fallen nation and the magical realm of the Los Angeles Witch School.
            </p>
          </div>
        </div>

        <h2 className="text-2xl text-indie-accent-green mb-4">Full Synopsis</h2>
        
        <div className="space-y-4 leading-relaxed">
          <p>
            <strong className="text-indie-accent-green">Tom Elwood's World:</strong> After escaping 
            from Britain's highest security prison with his reunited crew—the Copper Fist—Tom returns 
            to Sheffield to support his family through increasingly dangerous jobs. The country has 
            descended into chaos under governmental tyranny, where suspected terrorism charges are 
            weaponized against anyone who challenges the system. Tom and his crew—Butcher (demolitions), 
            Dave (muscle), Kestrel (tech specialist), Silas (infiltration), Brian (connections), and 
            Chris—represent the last line of resistance for ordinary people.
          </p>

          <p>
            <strong className="text-indie-accent-green">The Discovery:</strong> While working a job 
            at Dev's scrapyard, sifting through abandoned car parts and electronics, Tom uncovers an 
            ornate golden box containing an elaborately decorated broadsword. Unknown to him, this is 
            the Elwood Sword—a magical artifact of immense power that has been lost for generations.
          </p>

          <p>
            <strong className="text-indie-accent-green">The Los Angeles Witch School:</strong> Across 
            the Atlantic, in a world where cybernetic enhancements have merged with ancient magic, 
            three students from the prestigious L.A.W.S are dispatched on an urgent mission. Liam 
            (negotiator and leader), Jackie (combat specialist), and Abi (tactical support) form the 
            school's primary LARS unit (Legendary Artifact Recovery Squad), backed by Rose's remote 
            magical tracking and guidance.
          </p>

          <p>
            <strong className="text-indie-accent-green">The Convergence:</strong> As the LARS unit 
            systematically searches Britain for the sword's energy signature, Tom's brother Mike 
            warns him: "Just get rid of it, Tom! We can't have that kind of attention here." But it's 
            already too late. The discovery of the Elwood Sword sets in motion events that will force 
            both worlds to collide—where underground criminals must face magical students, and where 
            the fate of a fallen nation might rest in the hands of an artifact that bridges technology, 
            magic, and humanity.
          </p>

          <p>
            <strong className="text-indie-accent-green">Themes:</strong> L.A.W.S explores the 
            intersection of cyberpunk dystopia and urban fantasy, examining themes of resistance 
            against oppression, loyalty and betrayal, the evolution of magic through technology, 
            and the price of power. It's a story where wizards conjure energy with CPU implants, 
            where criminals become unlikely heroes, and where ancient artifacts hold the key to 
            either salvation or destruction.
          </p>

          <p>
            The narrative weaves between gritty heist planning and magical academy politics, between 
            the desperate survival of Britain's underclass and the privileged missions of American 
            magical students, building toward an inevitable confrontation that will test both sides' 
            understanding of justice, power, and what it means to be human in a world transformed by 
            both magic and machines.
          </p>
        </div>

        <div className="mt-8 p-6 bg-indie-bg-nav rounded-lg border border-indie-accent-green/30">
          <h2 className="text-2xl text-indie-accent-green mb-4">World Building Highlights</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Cybernetic Magic:</strong> CPU implants that run alongside the human brain, 
            enabling magical feats like levitation and energy manipulation</li>
            <li><strong>Credits Currency:</strong> An underworld cryptocurrency similar to Bitcoin, 
            disconnected from government control</li>
            <li><strong>The Copper Fist:</strong> Named after "a beggar with a handful of pennies 
            closed tight to his chest"—representing champions of the common people</li>
            <li><strong>Fallen Britain:</strong> A nation transformed into a wasteland under 
            oppressive rule, where scrapyards have become makeshift towns</li>
            <li><strong>Magical Artifacts:</strong> Ancient objects of power that predate modern 
            cyber-magic, holding secrets to both worlds' futures</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-indie-text-gray/70 italic">
            Status: Work in Progress
          </p>
        </div>
      </article>
    </PageWrapper>
  )
}
