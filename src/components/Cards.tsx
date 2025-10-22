import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

interface Card {
    id: string;
    text: string;
}

const data: Card[] = [
    { id: '1', text: 'Card 1' },
    { id: '2', text: 'Card 2' },
    { id: '3', text: 'Card 3' },
];

const SWIPE_THRESHOLD = 120;

const Cards: React.FC = () => {
    const { theme } = useTheme();
    const position = useRef(new Animated.ValueXY()).current;
    const [index, setIndex] = React.useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5,
            onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
            onPanResponderRelease: (_, g) => {
                if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
                    Animated.timing(position, {
                        toValue: { x: g.dx > 0 ? 500 : -500, y: g.dy },
                        duration: 180,
                        useNativeDriver: true,
                    }).start(() => {
                        position.setValue({ x: 0, y: 0 });
                        setIndex(i => i + 1);
                    });
                } else {
                    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true, friction: 5 }).start();
                }
            },
        })
    ).current;

    const renderCards = () =>
        data
            .slice(index)
            .map((card, i) => {
                const isTop = i === 0;
                const rotate = position.x.interpolate({
                    inputRange: [-300, 0, 300],
                    outputRange: ['-15deg', '0deg', '15deg'],
                });
                const style = isTop
                    ? {
                        transform: [
                            ...position.getTranslateTransform(),
                            { rotate },
                            {
                                scale: position.x.interpolate({
                                    inputRange: [-300, 0, 300],
                                    outputRange: [0.95, 1, 0.95],
                                    extrapolate: 'clamp'
                                })
                            }
                        ],
                    }
                    : { top: i * 8, transform: [{ scale: 1 - i * 0.04 }] };

                return (
                    <Animated.View
                        key={card.id}
                        style={[
                            styles.card,
                            { backgroundColor: theme.surface, shadowColor: theme.shadow },
                            style as any,
                            { zIndex: data.length - i }
                        ]}
                        {...(isTop ? panResponder.panHandlers : {})}
                    >
                        <Text style={[styles.text, { color: theme.text }]}>{card.text}</Text>
                    </Animated.View>
                );
            })
            .reverse();

    return <View style={styles.container}>{renderCards()}</View>;
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        position: 'absolute',
        width: '80%',
        height: '55%',
        borderRadius: 16,
        elevation: 6,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    text: { fontSize: 22, fontWeight: '600' },
});

export default Cards;