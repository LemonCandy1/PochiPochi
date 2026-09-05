import { CheckCircle2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PochiRepository } from '../../data/repository';
import { Colors } from '../../theme/colors';
import { ReportReason } from '../../types';

interface ReportModalProps {
  visible: boolean;
  questionId: string;
  onClose: () => void;
}

const REASONS: { id: ReportReason; label: string }[] = [
  { id: 'factual_inaccuracy', label: 'Factual Inaccuracy / Outdated' },
  { id: 'typo_grammar', label: 'Typo or Grammatical Error' },
  { id: 'mask_count_error', label: 'Incorrect Answer Mask / Character Count' },
  { id: 'inappropriate_offensive', label: 'Inappropriate or Offensive' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  questionId,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] =
    useState<ReportReason>('factual_inaccuracy');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await PochiRepository.submitReport(questionId, selectedReason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report Question</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.ink} />
            </Pressable>
          </View>

          {submitted ? (
            <View style={styles.submittedContainer}>
              <CheckCircle2 size={42} color={Colors.correct} />
              <Text style={styles.submittedText}>
                Report submitted for moderation!
              </Text>
              <Text style={styles.submittedSub}>
                Thank you for keeping PochiPochi high quality.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Help us keep our trivia database accurate and fun.
              </Text>

              {/* Reasons list */}
              <View style={styles.reasonsList}>
                {REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => setSelectedReason(r.id)}
                      style={[
                        styles.reasonItem,
                        isSelected && styles.reasonSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleActive,
                        ]}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          isSelected && styles.reasonTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Additional notes input */}
              <TextInput
                placeholder="Optional details (e.g. correct source)..."
                placeholderTextColor={Colors.inkMuted}
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              {/* Submit CTA */}
              <Pressable onPress={handleSubmit} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 30, 40, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.borderDark,
    padding: 20,
    shadowColor: Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.ink,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.inkSecondary,
    marginBottom: 14,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 14,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  reasonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.inkSecondary,
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
    flex: 1,
  },
  reasonTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: Colors.ink,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 65,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  submittedContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  submittedText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.ink,
    marginTop: 4,
  },
  submittedSub: {
    fontSize: 13,
    color: Colors.inkSecondary,
    textAlign: 'center',
  },
});
