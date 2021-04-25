//spa feito chamada api no client
//ssr feito chamada api no servidor no momento
//ssg feito chamada api em determinados momentos do dia

import { GetStaticProps} from 'next'; //serve para aplicar uma tipagem na função
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import {format, parseISO} from 'date-fns';// pra formatar a data recebida da api
import ptBR from 'date-fns/locale/pt-BR';// importando o tipo de data ptbr
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss'
import { usePlayer } from '../contexts/PlayerContext';



type Episode = {
  id: string;       //define os tipos de variavel da array episodes
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  publishedAt: string;
  durationAsString: string;
  url: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[]
}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  const {playList} = usePlayer()

  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return(
              <li key={episode.id}>
                <Image 
                  width={192} 
                  height={192}
                  src={episode.thumbnail} 
                  alt={episode.title}
                  objectFit="cover"
                 />

                <div className={styles.episodeDetails}> 
                  <Link href={`/episodes/${episode.id}`}> 
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}> 
                    <td style={{width: 72}}>
                      <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{width: 100}}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                        <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </section>
    </div>
    )
}

export  const getStaticProps: GetStaticProps = async () => {// tantos os parametros quanto os return da função tipada
  const {data} = await api.get('episodes', {//chamada API SSG(feita em momentos específicos do dia)  
  params: {  //axios permite fazer a request em formato JS
    _limit: 12,// limite de 12 resultados
    _sort: 'published_at',// eps e ordenado pela data de publicação
    _order: 'desc' //na ordem decrescente
  } 
  })

  const episodes = data.map(episode => {
    return{
      id: episode.id,                     //pegando as variaveis retornadas da api e formatando
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR }), //formatando horario
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })
  
  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return{
    props: {
      latestEpisodes, //passa os dados formatados
      allEpisodes
    },
    revalidate: 60 * 60 * 8,  // a cada 8 horas será feita uma chamada na API
  }
}