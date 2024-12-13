import React from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';

const CountryModal = ({ isVisible, country, toggleVisited, dismiss, visitedCountries }: any) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={dismiss}
        >
            <View style={styles.modal}>
                <Text style={styles.modalTitle}>
                    {country ? `Have you visited ${country.name_en}?` : ''}
                </Text>
                <Button
                    title={
                        visitedCountries.includes(country?.code || "")
                            ? "Mark as Unvisited"
                            : "Mark as Visited"
                    }
                    onPress={() => {
                        if (country) {
                            toggleVisited(country.code);
                            dismiss();
                        }
                    }}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default CountryModal;
