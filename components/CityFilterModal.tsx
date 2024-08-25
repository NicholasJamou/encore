import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Button, FlatList, Dimensions } from 'react-native';

interface CityFilterModalProps {
  visible: boolean;
  onClose: () => void;
  cities: string[];
  onSelectCity: (city: string) => void;
}

const CityFilterModal: React.FC<CityFilterModalProps> = ({ visible, onClose, cities, onSelectCity }) => {
  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => {
        console.log('City selected:', item); // Debugging log
        onSelectCity(item === 'All Cities' ? '' : item);
        onClose();
      }}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by City</Text>
          <FlatList
            data={cities}
            renderItem={renderCityItem}
            keyExtractor={(item) => item}
            style={styles.cityList}
          />
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cityList: {
    maxHeight: height * 0.5,
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default CityFilterModal;