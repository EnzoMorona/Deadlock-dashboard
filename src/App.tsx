import { useEffect, useState } from "react";
import { getPlayerMatchHistory } from "./services/deadlockApi";
import { calculatePlayerStats } from "./services/deadlockApi";
import { getItems } from "./services/deadlockApi";

type ItemSorteado<T> = {
  item: T;
  tierObrigatorio: number | null;
};
//o uso de T[] serve para mostrar que a funcao pode aceitar qualquer tipo generico, se adaptando com oque ela receber, se for number, vai virar number, mesma coisa com string
function sortearItens<T extends { item_tier: number }>(
  lista: T[], 
  quantidade = 12, 
  filtroTier: Record< number, number> = {}): ItemSorteado<T>[] {

  const embaralhada = (itens: T[]) => {// Funcao embaralha os itens da lista do deadlock

    const resultado = [...itens];

    for (let i = resultado.length - 1; i > 0; i--) {//faz um loop para repetir quantidade de vezes de itens na lista
      const j = Math.floor(Math.random() * (i + 1));//gera um numero aleatorio entre 0 e i
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];//troca os itens de posicao na lista
    }


    return resultado;
  }

  const garantidos: ItemSorteado<T>[] = [];

  for (const [tier, qtd] of Object.entries(filtroTier)) {
    const itensFiltrados = embaralhada(
      lista.filter(
        (item)=> item.item_tier === Number(tier) &&
        !garantidos.some((garantido) => garantido.item === item)//como agora ele esta dentro da estrutura de itemSorteado, ele precisa acessar o item dentro do objeto garantido, ao fazer isso seria tipo procurar se o {item}
      )
    )

    if (itensFiltrados.length < qtd) {
      throw new Error(`Não há itens suficientes do tier ${tier} para sortear ${qtd} itens.`);
    }

    garantidos.push(
      ...itensFiltrados.slice(0, qtd).map((item) => ({ item, tierObrigatorio: Number(tier) }))//essa parte transforma os itens filtrados em objetos do tipo ItemSorteado, ele vai de [A,B] para [{item: A, tierObrigatorio: 1}, {item: B, tierObrigatorio: 1}] e adiciona no array garantidos
    );
  }

  if (garantidos.length < quantidade) {
    const restantes = embaralhada(
      lista.filter((item) => !garantidos.some((garantido) => garantido.item === item))
    );

    garantidos.push(...restantes.slice(0, quantidade - garantidos.length).map((item) => ({ item, tierObrigatorio: null,
      }))
    );
  }

  return garantidos.slice(0, quantidade);
}



function App() {
  const [stats, setStats] = useState<
    ReturnType<typeof calculatePlayerStats> | null
  >(null);
  const [itens,setItens] = useState<any[]>([])
  const [itensAleatorios, setItensAleatorios] = useState<any[]>([]);

  useEffect(() => {
    //DANDO LOAD NO PLAYER SELECIONADO PELO MATCHE CODE
    async function loadPlayer() {
      try {
        const matches = await getPlayerMatchHistory(
          "76561198357349310"
        );

        const calculatedStats = calculatePlayerStats(matches);

        setStats(calculatedStats);

        console.log("Estatísticas:", calculatedStats);

        console.log(
          matches.map((match) => ({
            match_id: match.match_id,
            match_result: match.match_result,
            player_team: match.player_team,
            player_match_outcome: match.player_match_outcome,
            kills: match.player_kills,
            deaths: match.player_deaths,
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }

    // DANDO LOAD NOS ITENS DO JOGO
    async function loadItems() {
      try {
        const data = await getItems();

        const itensList = data.filter(
          (item: any) => item.shopable === true &&
                         item.item_tier <= 4
        );

        console.log("Todos os itens:", itensList);
        setItens(itensList)
        const sorteados = sortearItens(itensList, 12, { 4: 4, 3: 4, 2: 1, 1: 1 });
        setItensAleatorios(sorteados);
        console.log("Itens aleatórios:", sorteados);

      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      }
    }

    loadItems();

    loadPlayer();
  }, []);

  function sortearItem(position: number) {

    const itemAtual = itensAleatorios[position];

    let novoItem;
    
    if (itemAtual.tierObrigatorio !== null) {
      const itensSorteaveis = itens.filter((item) => 
        item.item_tier === itemAtual.tierObrigatorio &&
        !itensAleatorios.some((garantido) => 
          garantido.item === item
        )
      );
      novoItem = itensSorteaveis[Math.floor(Math.random() * itensSorteaveis.length)];
    } else if (itemAtual.tierObrigatorio === null) {
      const itensSorteaveis = itens.filter((item) => 
        !itensAleatorios.some((garantido) => garantido.item === item)
      );
      novoItem = itensSorteaveis[Math.floor(Math.random() * itensSorteaveis.length)];
    }

    itemAtual.item = novoItem;

    itensAleatorios[position] = itemAtual;
    console.log("Novo item sorteado:", itensAleatorios);
    return [...itensAleatorios];
  }
  

  if (!stats) {
    return <p>Carregando dados do jogador...</p>;
  }

  return (
    <div>
      <h1>Deadlock Player Dashboard</h1>

      <section>
        <h2>Resumo do jogador</h2>

        <p>
          Partidas no histórico: {stats.totalMatches}
        </p>

        <p>
          Partidas registradas: {stats.registeredMatches}
        </p>

        <p>
          Vitórias: {stats.wins}
        </p>

        <p>
          Derrotas: {stats.losses}
        </p>

        <p>
          Winrate: {stats.winrate.toFixed(2)}%
        </p>

        <p>
          Kills: {stats.kills}
        </p>

        <p>
          Deaths: {stats.deaths}
        </p>

        <p>
          Assists: {stats.assists}
        </p>

        <p>
          KDA: {stats.kda.toFixed(2)}
        </p>

        <p>
          Média de kills: {stats.averageKills.toFixed(2)}
        </p>

        <p>
          Média de deaths: {stats.averageDeaths.toFixed(2)}
        </p>

        <p>
          Média de assists: {stats.averageAssists.toFixed(2)}
        </p>

        <p>
          Duração média:{" "}
          {Math.floor(stats.averageDuration / 60)} min{" "}
          {Math.floor(stats.averageDuration % 60)} s
        </p>
      </section>

      <h1>Player Item Random</h1>
      <section>
        <h2>Itens Aleatórios</h2>
        {itensAleatorios.length === 0 ? (<p>Nenhum item encontrado.</p>) : (//caso a lista de itens aleatórios esteja vazia, exibe uma mensagem itens nao encontrados
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "16px",
              listStyle: "none",
              padding: 0,
            }}
          >
            {itensAleatorios.map((item, index) => (
              <button style={{ all: "unset", cursor: "pointer" }} key={item.item.id ?? item.item.class_name ?? index} onClick={() => {setItensAleatorios(sortearItem(index))}}>
                <li
                  key={item.item.id ?? item.item.class_name ?? index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "center",
                  }}
                >
                  {item.item.shop_image_webp && (
                    <img
                      src={item.item.shop_image_webp}
                      alt={item.item.name ?? "Imagem do Item"}
                      width={64}
                      height={64}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                  <span>{item.item.name ?? item.item.class_name ?? item.item.id ?? "Item sem nome"}</span>
                </li>
              </button>
            ))}
          </ul>
        )}
        <button onClick={() => {
          setItensAleatorios(sortearItens(itens, 12, { 4: 4, 3: 4, 2: 1, 1: 1 }));
        }}>
          Sortear Novamente
        </button>
      </section>
    </div>
  );
}

export default App;
