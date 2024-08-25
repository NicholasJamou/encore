import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Button } from 'react-native';
import BigList from 'react-native-big-list';

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
      onPress={() => onSelectCity(item === 'All Cities' ? '' : item)}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by City</Text>
          <BigList
            data={cities}
            renderItem={renderCityItem}
            itemHeight={50}
          />
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default CityFilterModal;