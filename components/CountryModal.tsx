import React from 'react';
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback  } from 'react-native';
import Modal from 'react-native-modal';

const CountryModal = ({ isVisible, country, toggleVisited, dismiss, visitedCountries }: any) => 
    { if (!country) return null;
    return (
        <Modal
            isVisible={isVisible}
            hasBackdrop={false}
            coverScreen={false}
            onBackdropPress={dismiss}
            backdropOpacity={0}
            useNativeDriver
            hideModalContentWhileAnimating
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
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        pointerEvents: 'box-none', // 👈 Wichtig: erlaubt Klicks "durch" das Modal hindurch
      },
      modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        pointerEvents: 'box-only', // Nur Modal-Inhalt fängt Klicks ab
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
      },
    });

export default CountryModal;
