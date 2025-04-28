import React from 'react';
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback, TouchableOpacity  } from 'react-native';
import Modal from 'react-native-modal';

const CountryModal = ({ 
  isVisible, 
  country, 
  toggleVisited,
  toggleWantToVisit, 
  dismiss, 
  onHideComplete,
  visitedCountries, 
  wantToVisitCountries,
  hideCloseButton 
}: any) => 
    { if (!country) return null;
        const visited = visitedCountries.includes(country.code);
        const want = wantToVisitCountries.includes(country.code);

        function countryCodeToEmoji(countryCode: string) {
          return countryCode.toUpperCase().replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
          );
        }

    return (
        <Modal
            isVisible={isVisible}
            animationIn="slideInDown"
            animationOut="slideOutUp"
            hasBackdrop={false}
            coverScreen={false}
            animationInTiming={150}
            animationOutTiming={600}
            backdropTransitionOutTiming={600}
            onBackButtonPress={dismiss}
            onBackdropPress={dismiss}
            onSwipeComplete={dismiss}
            swipeDirection="up"
            swipeThreshold={60}
            useNativeDriver={true}
            onModalHide={onHideComplete}
            style={styles.modalWrapper}
        >
        <View style={styles.modal}>
          <View style={styles.titleContainer}>
            <Text style={styles.modalTitleInline}>
              {country.name_en}
            </Text>
            <Text style={styles.flagEmojiInline}>
              {countryCodeToEmoji(country.iso_3166_1)}
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Visited</Text>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  toggleVisited(country.code);
                  dismiss();
                }}
              >
                <Text style={styles.checkboxText}>
                  {visited ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Wishlist</Text>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  toggleWantToVisit(country.code);
                  dismiss();
                }}
              >
                <Text style={styles.checkboxText}>
                  {want ? '★' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {!hideCloseButton && (
            <TouchableOpacity style={styles.topCloseButton} onPress={dismiss}>
              <Text style={styles.topCloseButtonText}>×</Text>
            </TouchableOpacity>
          )}
      </View>
    </Modal>
    );
};

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 10,
    pointerEvents: 'auto',
  },
  flagEmoji: {
    fontSize: 40,        // Größe des Emoji
    marginBottom: 10,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 1
  },
  checkboxLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDisabled: {
    opacity: 0.3,                // ausgegraut
    borderColor: '#999',
    },
  checkboxText: {
    fontSize: 18,
    color: '#f4a261'
  },
  modal: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 2,
    borderRadius: 0,   // Leichte Abrundung für ein moderneres Design
    width: '100%',       // Nimmt 90% der Bildschirmbreite ein, also weniger als den ganzen Screen
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagEmojiInline: {
    fontSize: 32,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',           // Ordnet die Buttons nebeneinander an
    justifyContent: 'space-between',// Gleichmäßiger Abstand
    width: '100%',                  // Container nimmt die gesamte Breite des Modals ein
  },
  primaryButton: {
    backgroundColor: '#3bb2d0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: '50%',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#fbb03b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  topCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fbb03b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleInline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  topCloseButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 20,
    alignItems: 'center',
  },
});

export default CountryModal;
