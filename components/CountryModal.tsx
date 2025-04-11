import React from 'react';
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback  } from 'react-native';
import Modal from 'react-native-modal';

const CountryModal = ({ isVisible, country, toggleVisited, dismiss, visitedCountries }: any) => 
    { if (!country) return null;
    return (

        <Modal
            isVisible={isVisible}
            animationIn="slideInDown"
            animationOut="slideOutUp"
            hasBackdrop={false}
            coverScreen={false}
            hideModalContentWhileAnimating = {true}
            onBackButtonPress = {dismiss}
            onSwipeComplete={dismiss}
            swipeDirection="up"
            swipeThreshold={60}
            useNativeDriver={true}
            style={styles.modalWrapper}
        >
            <View style={styles.modal}>
                <Text style={styles.modalTitle}>
                Have you visited {country.name_en}?
                </Text>
                <Button
                    title={
                        visitedCountries.includes(country.code)
                        ? 'Mark as Unvisited'
                        : 'Mark as Visited'
                    }
                onPress={() => {
                    toggleVisited(country.code);
                    dismiss();
                }}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalWrapper: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        margin: 0,
        pointerEvents: 'auto',
      },
      modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 0,
        width: '100%',
        pointerEvents: 'auto', 
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
      },
    });

export default CountryModal;
