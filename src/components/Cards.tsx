import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Card {
  id: string;
  title: string;
  description: string;
  image: any; // agora aceita require()
}

// Utilize require() para imagens locais na pasta assets/images
const data: Card[] = [
  { 
    id: '1', 
    title: 'Festival Amazonas de Ópera', 
    description: 'Um dos maiores eventos de ópera do Brasil, realizado no majestoso Teatro Amazonas.', 
    image: require('../../assets/manaus.jpg') 
  },
  { 
    id: '2', 
    title: 'Carnaval de Manaus', 
    description: 'A explosão de cores e ritmos no Sambódromo, com desfiles de Escolas de Samba e blocos de rua.', 
    image: require('../../assets/WhatsApp-Image-2024-12-11-at-11.32.39-1024x682.jpeg') 
  },
  { 
    id: '3', 
    title: 'Boi Manaus', 
    description: 'Celebração da cultura Boi-Bumbá com shows de artistas locais, aquecendo para Parintins.', 
    image: require('../../assets/3af8c85302d8abd52642c9d148711ba1.jpg') 
  },
  { 
    id: '4', 
    title: 'Festa teste', 
    description: 'local : rua cristovão colombo\nvalor:30 reais', 
    image: require('../../assets/4fa024953c01f8f3328168cc8db1a15c.jpg') 
  },
  { 
    id: '5', 
    title: 'Festa de São João em Manaus', 
    description: 'As tradicionais festas juninas com comidas típicas amazônicas, quadrilhas e muita animação regional.', 
    image: require('../../assets/8b7de8d210ffbf7b5ca684701e71e208.jpg') 
  },
  { 
    id: '6', 
    title: 'Festa do Cupuaçu', 
    description: 'Celebração gastronômica do fruto amazônico, com pratos, doces e shows (em Rio Preto da Eva, perto de Manaus).', 
    image: require('../../assets/8b7de8d210ffbf7b5ca684701e71e208.jpg') 
  },
  { 
    id: '7', 
    title: 'Réveillon na Ponta Negra', 
    description: 'Grande festa de virada do ano na praia da Ponta Negra, com shows e fogos de artifício no Rio Negro.', 
    image: require('../../assets/65949f240955c.png') 
  },
  { 
    id: '8', 
    title: 'Feira do Produtor/Gastronômica', 
    description: 'Eventos que destacam a culinária e produtos regionais, como no Mercado Adolpho Lisboa ou feiras itinerantes.', 
    image: require('../../assets/713077fac30d4e350ca6f5e4793ff1ae.jpg') 
  },
];

const SWIPE_THRESHOLD = 120;

const Cards: React.FC = () => {
  const position = useRef(new Animated.ValueXY()).current;
  const [index, setIndex] = React.useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) swipeCard(g.dx > 0 ? 1 : -1, g.dy);
        else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, friction: 5 }).start();
      },
    })
  ).current;

  const swipeCard = (direction: number, dy: number = 0) => {
    Animated.timing(position, {
      toValue: { x: direction > 0 ? 500 : -500, y: dy },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setIndex(i => i + 1);
    });
  };

  const renderCards = () =>
    data
      .slice(index)
      .map((card, i) => {
        const isTop = i === 0;
        const rotate = position.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-15deg', '0deg', '15deg'] });
        const style = isTop
          ? { transform: [...position.getTranslateTransform(), { rotate }] }
          : { display: 'none' }; // cards atrás não aparecem

        return (
          <Animated.View
            key={card.id}
            style={[styles.card, style as any, { zIndex: data.length - i }]}
            {...(isTop ? panResponder.panHandlers : {})}
          >
            <Image source={card.image} style={styles.cardImage} />

            {/* Gradiente para legibilidade do texto */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })
      .reverse();

  return (
    <View style={styles.container}>
      {renderCards()}

      {/* Botões fora do card */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => swipeCard(-1)}>
          <Text style={styles.buttonText}>✖️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={() => swipeCard(1)}>
          <Text style={styles.buttonText}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute',
    width: '108%',
    height: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: { width: '100%', height: '100%' },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    justifyContent: 'flex-end',
  },
  cardInfo: { padding: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  cardDescription: { fontSize: 16, color: '#fff', marginTop: 4 },
  buttonsContainer: { position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
  button: { width: 70, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});

export default Cards;
